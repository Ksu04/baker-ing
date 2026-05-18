'use client'
import {
  Stack,
  TextField,
  Box,
  Paper,
  Typography,
  Button,
  Alert,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import ImageUpload from './ImageUpload'
import NutritionInputs from './NutritionInputs'
import IngredientsList from './IngredientsList'
import type { Ingredient, SelectedIngredient, Product } from './types'

type FormField =
  | 'name'
  | 'description'
  | 'photo'
  | 'kcal'
  | 'protein'
  | 'fat'
  | 'carbs'

interface ProductFormProps {
  editingId: string | null
  name: string
  description: string
  photo: string
  fileInput: File | null
  ingredients: Ingredient[]
  selectedIngredients: SelectedIngredient[]
  ingredientWeights: { [key: string]: string }
  kcal: string
  protein: string
  fat: string
  carbs: string
  error: string | null
  onChange: (field: FormField, value: string) => void
  onFileChange: (file: File | null) => void
  onAddIngredient: (
    ingredientId: string,
    weight: number,
    metric: string
  ) => void
  onRemoveIngredient: (ingredientId: string) => void
  onWeightChange: (ingredientId: string, weight: string) => void
  onCancel: () => void
  onSubmit: (e: React.FormEvent) => void
}

export default function ProductForm({
  editingId,
  name,
  description,
  photo,
  fileInput,
  ingredients,
  selectedIngredients,
  ingredientWeights,
  kcal,
  protein,
  fat,
  carbs,
  error,
  onChange,
  onFileChange,
  onAddIngredient,
  onRemoveIngredient,
  onWeightChange,
  onCancel,
  onSubmit,
}: ProductFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <Stack spacing={3}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.default',
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              mb: 3,
              fontWeight: 700,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              color: 'primary.main',
            }}
          >
            Product Details
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 3,
              flexDirection: { xs: 'column', md: 'row' },
            }}
          >
            <Box sx={{ flex: 1, maxWidth: { md: 280 } }}>
              <ImageUpload
                photo={photo}
                onPhotoChange={(v) => onChange('photo', v)}
                onFileChange={onFileChange}
              />
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ display: 'block', mt: 1, textAlign: 'center' }}
              >
                Upload product image. Leave empty for default.
              </Typography>
            </Box>

            <Stack spacing={2} sx={{ flex: 2 }}>
              <TextField
                fullWidth
                label="Product Name"
                value={name}
                onChange={(e) => onChange('name', e.target.value)}
                required
                size="small"
                placeholder="e.g., Chocolate Cake"
              />
              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => onChange('description', e.target.value)}
                multiline
                rows={4}
                size="small"
                placeholder="Describe your product..."
              />

              <NutritionInputs
                kcal={kcal}
                protein={protein}
                fat={fat}
                carbs={carbs}
                onKcalChange={(v) => onChange('kcal', v)}
                onProteinChange={(v) => onChange('protein', v)}
                onFatChange={(v) => onChange('fat', v)}
                onCarbsChange={(v) => onChange('carbs', v)}
              />
            </Stack>
          </Box>
        </Paper>

        <IngredientsList
          ingredients={ingredients}
          selectedIngredients={selectedIngredients}
          ingredientWeights={ingredientWeights}
          onAddIngredient={onAddIngredient}
          onRemoveIngredient={onRemoveIngredient}
          onWeightChange={onWeightChange}
        />

        {error && <Alert severity="error">{error}</Alert>}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button type="button" variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
          >
            {editingId ? 'Update Product' : 'Create Product'}
          </Button>
        </Box>
      </Stack>
    </form>
  )
}
