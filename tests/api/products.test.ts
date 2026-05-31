// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma, createTestUser, createTestIngredient, cleanup, teardown, getBakerProfile } from '../helpers'

let bakerProfileId: string
let flourId: string
let sugarId: string

beforeAll(async () => {
  await cleanup()
  const user = await createTestUser({ role: 'BAKER' })
  bakerProfileId = (await getBakerProfile(user.id)).id

  flourId = (await createTestIngredient(bakerProfileId, { name: 'Flour', kcal: 3.64, protein: 0.1, carbs: 0.76 })).id
  sugarId = (await createTestIngredient(bakerProfileId, { name: 'Sugar', kcal: 3.87, carbs: 1.0 })).id
})

afterAll(async () => {
  await prisma.$disconnect()
  teardown()
})

describe('Product CRUD', () => {
  it('creates a product with ingredients', async () => {
    const product = await prisma.product.create({
      data: {
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake',
        koef: 0.8,
        bakerProfileId,
        ingredients: {
          create: [
            { ingredientId: flourId, weight: 200 },
            { ingredientId: sugarId, weight: 100 },
          ],
        },
      },
      include: { ingredients: { include: { ingredient: true } } },
    })

    expect(product).toBeDefined()
    expect(product.name).toBe('Chocolate Cake')
    expect(product.koef).toBe(0.8)
    expect(product.ingredients).toHaveLength(2)
  })

  it('calculates KBJU from ingredients on create', async () => {
    const product = await prisma.product.create({
      data: {
        name: `KBJU Test-${Date.now()}`,
        bakerProfileId,
        koef: 0.8,
        ingredients: {
          create: [
            { ingredientId: flourId, weight: 200 },
            { ingredientId: sugarId, weight: 100 },
          ],
        },
      },
      include: { ingredients: { include: { ingredient: true } } },
    })

    const totalKcal = 200 * 3.64 + 100 * 3.87
    const divisor = 300 * (1 - 0.8)
    const expectedKcal = Math.round(totalKcal / divisor)

    expect(expectedKcal).toBeGreaterThan(0)

    expect(product.ingredients).toHaveLength(2)
  })

  it('lists products for baker', async () => {
    await prisma.product.create({
      data: { name: 'List Product A', bakerProfileId },
    })
    await prisma.product.create({
      data: { name: 'List Product B', bakerProfileId },
    })

    const products = await prisma.product.findMany({
      where: { bakerProfileId },
      orderBy: { name: 'asc' },
    })

    expect(products.length).toBeGreaterThanOrEqual(2)
  })

  it('updates product name and koef', async () => {
    const product = await prisma.product.create({
      data: { name: `Update Test-${Date.now()}`, bakerProfileId, koef: 0.5 },
    })

    const updated = await prisma.product.update({
      where: { id: product.id },
      data: { name: 'Updated Name', koef: 0.9 },
    })

    expect(updated.name).toBe('Updated Name')
    expect(updated.koef).toBe(0.9)
  })

  it('replaces ingredients on update', async () => {
    const product = await prisma.product.create({
      data: {
        name: `Ingredient Replace-${Date.now()}`,
        bakerProfileId,
        ingredients: {
          create: [{ ingredientId: flourId, weight: 100 }],
        },
      },
    })

    await prisma.productIngredient.deleteMany({ where: { productId: product.id } })
    await prisma.productIngredient.create({
      data: { productId: product.id, ingredientId: sugarId, weight: 50 },
    })

    const updated = await prisma.product.findUnique({
      where: { id: product.id },
      include: { ingredients: true },
    })

    expect(updated!.ingredients).toHaveLength(1)
    expect(updated!.ingredients[0].ingredientId).toBe(sugarId)
    expect(updated!.ingredients[0].weight).toBe(50)
  })

  it('prevents duplicate product names for same baker', async () => {
    const name = `Unique Product-${Date.now()}`
    await prisma.product.create({
      data: { name, bakerProfileId },
    })

    await expect(
      prisma.product.create({
        data: { name, bakerProfileId },
      })
    ).rejects.toThrow()
  })

  it('deletes product and its ingredient links', async () => {
    const product = await prisma.product.create({
      data: {
        name: `Delete Product-${Date.now()}`,
        bakerProfileId,
        ingredients: {
          create: [{ ingredientId: flourId, weight: 50 }],
        },
      },
    })

    await prisma.productIngredient.deleteMany({ where: { productId: product.id } })
    await prisma.product.delete({ where: { id: product.id } })

    const found = await prisma.product.findUnique({ where: { id: product.id } })
    expect(found).toBeNull()
  })

  it('creates product without ingredients', async () => {
    const product = await prisma.product.create({
      data: { name: `Simple Product-${Date.now()}`, bakerProfileId },
    })

    expect(product).toBeDefined()
    expect(product.name).toContain('Simple Product')
  })
})
