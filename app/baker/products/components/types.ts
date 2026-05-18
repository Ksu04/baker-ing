import type { Prisma } from '@/app/generated/prisma/client'
import type { ProductBasic, IngredientBasic } from '@/app/types'

export type Product = Prisma.ProductGetPayload<{
  include: { ingredients: { include: { ingredient: true } } }
}>

export type Ingredient = Prisma.IngredientGetPayload<{}>
export type ProductIngredient = Prisma.ProductIngredientGetPayload<{}>

export interface SelectedIngredient {
  ingredientId: string
  weight: number
  metric: string
}

export type { ProductBasic, IngredientBasic }
