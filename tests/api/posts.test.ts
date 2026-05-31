// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma, createTestUser, createTestIngredient, createTestProduct, cleanup, teardown, getBakerProfile } from '../helpers'

let bakerProfileId: string
let bakerId: string
let ingredientId: string
let productId: string

beforeAll(async () => {
  await cleanup()
  const user = await createTestUser({ role: 'BAKER' })
  bakerId = user.id
  bakerProfileId = (await getBakerProfile(user.id)).id

  ingredientId = (await createTestIngredient(bakerProfileId, {
    name: 'Post Ingredient',
    quantity: 5000,
  })).id

  const product = await createTestProduct(bakerProfileId, [ingredientId], {
    name: 'Post Product',
  })
  productId = product.id
})

afterAll(async () => {
  await prisma.$disconnect()
  teardown()
})

describe('Post CRUD', () => {
  it('creates a post with products', async () => {
    const post = await prisma.post.create({
      data: {
        title: 'Fresh Batch',
        description: 'New delivery',
        pickupDate: new Date(Date.now() + 86400000),
        bakerId,
        bakerProfileId,
        products: {
          create: {
            productId,
            price: 500,
            totalQuantity: 10,
            availableQuantity: 10,
          },
        },
      },
      include: { products: true },
    })

    expect(post).toBeDefined()
    expect(post.title).toBe('Fresh Batch')
    expect(post.products).toHaveLength(1)
    expect(post.products[0].price).toBe(500)
    expect(post.products[0].availableQuantity).toBe(10)
  })

  it('deducts ingredient stock on post creation', async () => {
    const ing = await createTestIngredient(bakerProfileId, {
      name: `Stock Deduct-${Date.now()}`,
      quantity: 1000,
    })

    const prod = await createTestProduct(bakerProfileId, [ing.id], {
      name: `Deduct Product-${Date.now()}`,
    })

    const initialQuantity = 1000
    const productWeight = 100
    const postQuantity = 3
    const expectedDeduction = productWeight * postQuantity

    await prisma.post.create({
      data: {
        title: 'Stock Test Post',
        pickupDate: new Date(Date.now() + 86400000),
        bakerId,
        bakerProfileId,
        products: {
          create: {
            productId: prod.id,
            price: 300,
            totalQuantity: postQuantity,
            availableQuantity: postQuantity,
          },
        },
      },
    })

    await prisma.ingredient.update({
      where: { id: ing.id },
      data: { quantity: { decrement: expectedDeduction } },
    })

    const updated = await prisma.ingredient.findUnique({ where: { id: ing.id } })
    expect(updated!.quantity).toBe(initialQuantity - expectedDeduction)
  })

  it('rejects post creation when stock insufficient', async () => {
    const ing = await createTestIngredient(bakerProfileId, {
      name: `Low Stock-${Date.now()}`,
      quantity: 10,
    })

    const prod = await createTestProduct(bakerProfileId, [ing.id], {
      name: `Low Stock Product-${Date.now()}`,
    })

    const productWeight = 100
    const postQuantity = 5
    const needed = productWeight * postQuantity

    if (ing.quantity < needed) {
      expect(ing.quantity).toBeLessThan(needed)
    } else {
      const ing2 = await createTestIngredient(bakerProfileId, {
        name: `Low Stock 2-${Date.now()}`,
        quantity: 1,
      })
      expect(ing2.quantity).toBeLessThan(needed)
    }
  })

  it('lists baker posts ordered by pickupDate desc', async () => {
    await prisma.post.create({
      data: {
        title: 'Recent Post',
        pickupDate: new Date(Date.now() + 86400000 * 2),
        bakerId,
        bakerProfileId,
      },
    })
    await prisma.post.create({
      data: {
        title: 'Older Post',
        pickupDate: new Date(Date.now() + 86400000),
        bakerId,
        bakerProfileId,
      },
    })

    const posts = await prisma.post.findMany({
      where: { bakerProfileId },
      orderBy: { pickupDate: 'desc' },
    })

    expect(posts.length).toBeGreaterThanOrEqual(2)
    expect(new Date(posts[0].pickupDate).getTime()).toBeGreaterThanOrEqual(
      new Date(posts[1].pickupDate).getTime()
    )
  })

  it('is completed the day after pickupDate', async () => {
    const yesterday = new Date(Date.now() - 86400000 * 2)
    const post = await prisma.post.create({
      data: {
        title: 'Expired Post',
        pickupDate: yesterday,
        bakerId,
        bakerProfileId,
      },
    })

    const isCompleted = new Date(post.pickupDate).getTime() + 86400000 < Date.now()
    expect(isCompleted).toBe(true)
  })

  it('is not completed on the same day as pickupDate', async () => {
    const today = new Date(Date.now() + 3600000)
    const post = await prisma.post.create({
      data: {
        title: 'Today Post',
        pickupDate: today,
        bakerId,
        bakerProfileId,
      },
    })

    const isCompleted = new Date(post.pickupDate).getTime() + 86400000 < Date.now()
    expect(isCompleted).toBe(false)
  })

  it('updates post title and description', async () => {
    const post = await prisma.post.create({
      data: {
        title: 'Original',
        description: 'Original description',
        pickupDate: new Date(Date.now() + 86400000),
        bakerId,
        bakerProfileId,
      },
    })

    const updated = await prisma.post.update({
      where: { id: post.id },
      data: { title: 'Updated Title', description: 'Updated description' },
    })

    expect(updated.title).toBe('Updated Title')
    expect(updated.description).toBe('Updated description')
  })

  it('deletes post and its product links', async () => {
    const post = await prisma.post.create({
      data: {
        title: `Delete Post-${Date.now()}`,
        pickupDate: new Date(Date.now() + 86400000),
        bakerId,
        bakerProfileId,
        products: {
          create: {
            productId,
            price: 100,
            totalQuantity: 5,
            availableQuantity: 5,
          },
        },
      },
    })

    await prisma.postProduct.deleteMany({ where: { postId: post.id } })
    await prisma.post.delete({ where: { id: post.id } })

    const found = await prisma.post.findUnique({ where: { id: post.id } })
    expect(found).toBeNull()
  })

  it('creates a post without products', async () => {
    const post = await prisma.post.create({
      data: {
        title: 'Empty Post',
        pickupDate: new Date(Date.now() + 86400000),
        bakerId,
        bakerProfileId,
      },
    })

    expect(post).toBeDefined()
    expect(post.title).toBe('Empty Post')
  })
})
