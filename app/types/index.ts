export interface NutritionInfo {
  kcal: number | null
  protein: number | null
  fat: number | null
  carbs: number | null
}

export interface IngredientBasic {
  id: string
  weight: number | null
  metric: string | null
  ingredient: { name: string; kcal: number | null; protein: number | null; fat: number | null; carbs: number | null }
}

export interface ProductBasic {
  id: string
  name: string
  description: string | null
  photo: string | null
  kcal: number | null
  protein: number | null
  fat: number | null
  carbs: number | null
  koef: number | null
  ingredients: IngredientBasic[]
}

export interface PostProduct {
  id: string
  productId: string
  price: number
  totalQuantity: number
  availableQuantity: number
  product: ProductBasic
}

export interface BakerProfileBasic {
  id: string
  bio: string | null
  user: { name: string | null }
}

export interface Post {
  id: string
  title: string
  description: string | null
  pickupDate: string
  products: PostProduct[]
  bakerProfile: BakerProfileBasic
}

export interface PostWithProducts extends Omit<Post, 'bakerProfile'> {
  bakerProfile: {
    id: string
    bio: string | null
    user: { name: string | null }
  }
}

export interface BakerInfo {
  id: string
  name: string | null
  bio: string | null
  avatar: string | null
}

export interface BookingProduct {
  name: string
  description: string | null
  photo: string | null
  ingredients: string | null
  kcal: number | null
  protein: number | null
  fat: number | null
  carbs: number | null
  koef: number | null
  ingredientList: IngredientBasic[]
}

export interface BookingItem {
  id: string
  quantity: number
  price: number
  product: BookingProduct
}

export interface GroupedBooking {
  postId: string
  postTitle: string
  postDescription: string | null
  pickupDate: string
  createdAt: string
  baker: BakerInfo
  items: BookingItem[]
}