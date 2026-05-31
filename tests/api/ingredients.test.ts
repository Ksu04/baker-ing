// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma, createTestUser, createTestIngredient, cleanup, teardown, getBakerProfile } from '../helpers'

let bakerProfileId: string

beforeAll(async () => {
  await cleanup()
  const user = await createTestUser({ role: 'BAKER' })
  bakerProfileId = (await getBakerProfile(user.id)).id
})

afterAll(async () => {
  await prisma.$disconnect()
  teardown()
})

describe('Ingredient CRUD', () => {
  it('creates an ingredient with nutrition data', async () => {
    const ingredient = await prisma.ingredient.create({
      data: {
        name: 'Test Flour',
        quantity: 5000,
        metric: 'g',
        kcal: 3.64,
        protein: 0.1,
        fat: 0.01,
        carbs: 0.76,
        bakerProfileId,
      },
    })

    expect(ingredient).toBeDefined()
    expect(ingredient.name).toBe('Test Flour')
    expect(ingredient.kcal).toBe(3.64)
    expect(ingredient.protein).toBe(0.1)
  })

  it('creates an ingredient with helper', async () => {
    const ingredient = await createTestIngredient(bakerProfileId, {
      name: 'Helper Sugar',
      kcal: 3.87,
      carbs: 1.0,
    })

    expect(ingredient.name).toBe('Helper Sugar')
    expect(ingredient.kcal).toBe(3.87)
  })

  it('lists ingredients for baker', async () => {
    await createTestIngredient(bakerProfileId, { name: 'List Item A' })
    await createTestIngredient(bakerProfileId, { name: 'List Item B' })

    const ingredients = await prisma.ingredient.findMany({
      where: { bakerProfileId },
      orderBy: { name: 'asc' },
    })

    expect(ingredients.length).toBeGreaterThanOrEqual(2)
  })

  it('updates ingredient quantity (add stock)', async () => {
    const ing = await createTestIngredient(bakerProfileId, {
      name: 'Stock Test',
      quantity: 100,
    })
    expect(ing.quantity).toBe(100)

    const updated = await prisma.ingredient.update({
      where: { id: ing.id },
      data: { quantity: { increment: 50 } },
    })
    expect(updated.quantity).toBe(150)
  })

  it('updates ingredient nutrition', async () => {
    const ing = await createTestIngredient(bakerProfileId, {
      name: 'Nutrition Update',
      kcal: 2.0,
    })

    const updated = await prisma.ingredient.update({
      where: { id: ing.id },
      data: { kcal: 4.5, protein: 0.2 },
    })
    expect(updated.kcal).toBe(4.5)
    expect(updated.protein).toBe(0.2)
  })

  it('deletes an ingredient', async () => {
    const ing = await createTestIngredient(bakerProfileId, {
      name: `Delete Me-${Date.now()}`,
    })

    await prisma.ingredient.delete({ where: { id: ing.id } })

    const found = await prisma.ingredient.findUnique({ where: { id: ing.id } })
    expect(found).toBeNull()
  })

  it('prevents duplicate ingredient names for same baker', async () => {
    const name = `Unique-${Date.now()}`
    await createTestIngredient(bakerProfileId, { name })

    await expect(
      prisma.ingredient.create({
        data: { name, bakerProfileId, quantity: 100 },
      })
    ).rejects.toThrow()
  })

  it('prevents deleting ingredient linked to a product', async () => {
    const ing = await createTestIngredient(bakerProfileId, {
      name: `Protected-${Date.now()}`,
    })

    await prisma.product.create({
      data: {
        name: 'Linked Product',
        bakerProfileId,
        ingredients: {
          create: { ingredientId: ing.id, weight: 50 },
        },
      },
    })

    await expect(
      prisma.ingredient.delete({ where: { id: ing.id } })
    ).rejects.toThrow()
  })
})
