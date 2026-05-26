interface IngredientWithNutrition {
  weight: number | null
  ingredient: {
    kcal: number | null
    protein: number | null
    fat: number | null
    carbs: number | null
  }
}

interface NutritionValues {
  kcal: number | null
  protein: number | null
  fat: number | null
  carbs: number | null
}

export function calculateKBJU(
  ingredients: IngredientWithNutrition[],
  koef?: number | null
): NutritionValues {
  const filtered = ingredients.filter((i) => i.weight && i.weight > 0)
  if (filtered.length === 0) return { kcal: null, protein: null, fat: null, carbs: null }

  let totalWeight = 0
  let totalKcal = 0
  let totalProtein = 0
  let totalFat = 0
  let totalCarbs = 0

  for (const item of filtered) {
    const weight = item.weight!
    totalWeight += weight
    totalKcal += (item.ingredient.kcal ?? 0) * weight
    totalProtein += (item.ingredient.protein ?? 0) * weight
    totalFat += (item.ingredient.fat ?? 0) * weight
    totalCarbs += (item.ingredient.carbs ?? 0) * weight
  }

  if (totalWeight === 0) return { kcal: null, protein: null, fat: null, carbs: null }

  const divisor = totalWeight * (1 - (koef ?? 0))
  if (divisor === 0) return { kcal: null, protein: null, fat: null, carbs: null }

  return {
    kcal: Math.round(totalKcal / divisor),
    protein: Math.round((totalProtein / divisor) * 10) / 10,
    fat: Math.round((totalFat / divisor) * 10) / 10,
    carbs: Math.round((totalCarbs / divisor) * 10) / 10,
  }
}
