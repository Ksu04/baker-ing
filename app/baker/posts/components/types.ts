import type { ProductBasic, PostProduct as PostProductType, PostWithProducts as PostWithProductsType } from '@/app/types'

export type Product = ProductBasic
export type PostProductUI = PostProductType

export type PostWithProducts = PostWithProductsType

export interface SelectedPostProduct {
  productId: string
  price: string
  quantity: string
}
