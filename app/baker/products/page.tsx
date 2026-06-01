'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Box, Typography, CircularProgress, Alert } from '@mui/material'

import { useFormState, useListState } from '../../hooks/useFormState'
import ProductHeader from './components/ProductHeader'
import ProductFormToggle from './components/ProductFormToggle'
import ProductForm from './components/ProductForm'
import ProductGrid from './components/ProductGrid'
import DeleteConfirmDialog from './components/DeleteConfirmDialog'
import type {
  Product,
  Ingredient,
  SelectedIngredient,
} from './components/types'

interface FormValues {
  name: string
  description: string
  photo: string
  koef: string
}

export default function ProductsPage() {
  const { data: session, status } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [fileInput, setFileInput] = useState<File | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useFormState<FormValues>({
    initialValues: {
      name: '',
      description: '',
      photo: '',
      koef: '',
    },
  })

  const selectedIngredients = useListState<SelectedIngredient>()
  const [ingredientWeights, setIngredientWeights] = useState<{
    [key: string]: string
  }>({})

  useEffect(() => {
    if (session?.user?.role === 'BAKER') {
      Promise.all([
        fetch('/api/products').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/ingredients').then((r) => (r.ok ? r.json() : [])),
      ]).then(([p, i]) => {
        setProducts(p)
        setIngredients(i)
      })
    }
  }, [session])

  if (status === 'loading' || status === 'unauthenticated')
    return <CircularProgress sx={{ mt: 4 }} />
  if (session?.user?.role !== 'BAKER') {
    return <Alert severity="error">Нет доступа</Alert>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const method = editingId ? 'PUT' : 'POST'
    const { name, description, photo, koef } = form.values
    const body = editingId
      ? {
          id: editingId,
          name,
          description,
          photo,
          ingredients: selectedIngredients.items,
          koef: koef ? parseFloat(koef) : null,
        }
      : {
          name,
          description,
          photo,
          ingredients: selectedIngredients.items,
          koef: koef ? parseFloat(koef) : null,
        }

    const res = await fetch('/api/products', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      resetForm()
      const updated = await fetch('/api/products').then((r) => r.json())
      setProducts(updated)
    } else {
      try {
        setError((await res.json()).error)
      } catch {
        setError('Ошибка создания продукта')
      }
    }
  }

  const handleAddIngredient = (
    ingredientId: string,
    weight: number,
    metric: string
  ) => {
    selectedIngredients.setItems((prev) => {
      if (prev.some((i) => i.ingredientId === ingredientId)) {
        return prev
      }
      return [...prev, { ingredientId, weight, metric }]
    })
  }

  const handleRemoveIngredient = (ingredientId: string) => {
    selectedIngredients.setItems((prev) => prev.filter((item) => item.ingredientId !== ingredientId))
    setIngredientWeights((prev: Record<string, string>) => ({
      ...prev,
      [ingredientId]: '',
    }))
  }

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    form.fill({
      name: product.name,
      description: product.description || '',
      photo: product.photo || '',
      koef: product.koef?.toString() || '',
    })
    selectedIngredients.setItems(
      product.ingredients.map((i) => ({
        ingredientId: i.ingredientId,
        weight: i.weight ?? 0,
        metric: i.metric || 'г',
      }))
    )
    const weights: { [key: string]: string } = {}
    product.ingredients.forEach((i) => {
      weights[i.ingredientId] = (i.weight ?? 0).toString()
    })
    setIngredientWeights(weights)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showForm = !!editingId || isCreating

  const resetForm = () => {
    setEditingId(null)
    setIsCreating(false)
    setFileInput(null)
    form.reset()
    selectedIngredients.clear()
    setIngredientWeights({})
  }

  const handleCancel = () => {
    resetForm()
  }

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      const res = await fetch(`/api/products?id=${deleteId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        const updated = await fetch('/api/products').then((r) => r.json())
        setProducts(updated)
        setDeleteId(null)
      }
    }
  }

  return (
    <Box sx={{ pb: 4 }}>
      <ProductHeader />

      <ProductFormToggle
        showForm={showForm}
        isEditing={!!editingId}
        onToggle={() => (showForm ? handleCancel() : setIsCreating(true))}
      >
        <ProductForm
          editingId={editingId}
          name={form.values.name}
          description={form.values.description}
          photo={form.values.photo}
          fileInput={fileInput}
          ingredients={ingredients}
          selectedIngredients={selectedIngredients.items}
          ingredientWeights={ingredientWeights}
          koef={form.values.koef}
          error={error}
          onChange={(field, value) => form.setValue(field, value)}
          onFileChange={setFileInput}
          onAddIngredient={handleAddIngredient}
          onRemoveIngredient={handleRemoveIngredient}
          onWeightChange={(id, w) => {
            setIngredientWeights((prev: Record<string, string>) => ({
              ...prev,
              [id]: w,
            }))
            selectedIngredients.setItems((prev) =>
              prev.map((item) =>
                item.ingredientId === id ? { ...item, weight: parseFloat(w) || 0 } : item
              )
            )
          }}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      </ProductFormToggle>

      <Typography
        variant="h5"
        sx={{ mb: 3, fontWeight: 600, color: '#000000' }}
      >
        Ваши продукты ({products.length})
      </Typography>

      <ProductGrid
        products={products}
        onEdit={handleEdit}
        onDelete={setDeleteId}
      />

      <DeleteConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  )
}
