import { describe, it, expect } from 'vitest'
import { calculateKBJU } from './nutrition'

const makeIngredient = (
  weight: number | null,
  kcal: number | null,
  protein: number | null,
  fat: number | null,
  carbs: number | null
) => ({
  weight,
  ingredient: { kcal, protein, fat, carbs },
})

describe('calculateKBJU', () => {
  it('returns nulls for empty ingredients', () => {
    expect(calculateKBJU([])).toEqual({
      kcal: null,
      protein: null,
      fat: null,
      carbs: null,
    })
  })

  it('returns nulls when all weights are null/zero', () => {
    const ingredients = [
      makeIngredient(null, 10, 1, 0.5, 2),
      makeIngredient(0, 10, 1, 0.5, 2),
    ]
    expect(calculateKBJU(ingredients)).toEqual({
      kcal: null,
      protein: null,
      fat: null,
      carbs: null,
    })
  })

  it('calculates KBJU per 1g of finished product without koef', () => {
    // 200g × 3.64 = 728 kcal, 200g × 0.1 = 20 protein
    // 100g × 3.87 = 387 kcal
    // totalKcal = 1115, totalWeight = 300
    // divisor = 300, kcal = round(1115/300) = 4
    // protein = round(20/300 × 10) / 10 = 0.1
    // fat = round(2/300 × 10) / 10 = 0
    // carbs = round(252/300 × 10) / 10 = 0.8
    const ingredients = [
      makeIngredient(200, 3.64, 0.1, 0.01, 0.76),
      makeIngredient(100, 3.87, 0, 0, 1.0),
    ]

    const result = calculateKBJU(ingredients)
    expect(result.kcal).toBe(4)
    expect(result.protein).toBe(0.1)
    expect(result.fat).toBe(0)
    expect(result.carbs).toBe(0.8)
  })

  it('applies koef (moisture loss) correctly', () => {
    // 200g × 3.64 = 728, divisor = 200 × 0.2 = 40
    // kcal = round(728 / 40) = 18
    const ingredients = [makeIngredient(200, 3.64, 0.1, 0.01, 0.76)]

    const result = calculateKBJU(ingredients, 0.8)
    expect(result.kcal).toBe(18)
  })

  it('returns nulls when koef is 1 (divisor becomes 0)', () => {
    const ingredients = [makeIngredient(100, 10, 1, 0.5, 2)]
    expect(calculateKBJU(ingredients, 1)).toEqual({
      kcal: null,
      protein: null,
      fat: null,
      carbs: null,
    })
  })

  it('handles missing nutrition values as 0', () => {
    const ingredients = [makeIngredient(100, null, null, null, null)]
    const result = calculateKBJU(ingredients)
    expect(result.kcal).toBe(0)
    expect(result.protein).toBe(0)
    expect(result.fat).toBe(0)
    expect(result.carbs).toBe(0)
  })

  it('works with a single ingredient', () => {
    const ingredients = [makeIngredient(50, 2, 0.05, 0.02, 0.1)]
    const result = calculateKBJU(ingredients)
    // total = 50 × 2 = 100, divisor = 50
    // kcal = 100 / 50 = 2
    expect(result.kcal).toBe(2)
  })
})
