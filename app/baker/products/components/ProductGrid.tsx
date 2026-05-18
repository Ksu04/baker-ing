'use client'
import { Box } from '@mui/material'
import ProductCard from './ProductCard'
import EmptyProductsState from './EmptyProductsState'
import type { Product } from './types'

interface ProductGridProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
}

export default function ProductGrid({
  products,
  onEdit,
  onDelete,
}: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyProductsState />
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 3,
      }}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Box>
  )
}
