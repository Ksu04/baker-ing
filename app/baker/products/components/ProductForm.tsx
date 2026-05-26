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
import IngredientsList from './IngredientsList'
import type { Ingredient, SelectedIngredient, Product } from './types'

type FormField =
  | 'name'
  | 'description'
  | 'photo'
  | 'koef'

interface ProductFormProps {
  editingId: string | null
  name: string
  description: string
  photo: string
  fileInput: File | null
  ingredients: Ingredient[]
  selectedIngredients: SelectedIngredient[]
  ingredientWeights: { [key: string]: string }
  koef: string
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
  koef,
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
              color: '#000000',
            }}
          >
            Детали продукта
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
                Загрузите изображение. Оставьте пустым для стандартного.
              </Typography>
            </Box>

            <Stack spacing={2} sx={{ flex: 2 }}>
              <TextField
                fullWidth
                label="Название"
                value={name}
                onChange={(e) => onChange('name', e.target.value)}
                required
                size="small"
                placeholder="например, Шоколадный торт"
              />
              <TextField
                fullWidth
                label="Описание"
                value={description}
                onChange={(e) => onChange('description', e.target.value)}
                multiline
                rows={4}
                size="small"
                placeholder="Опишите ваш продукт..."
              />

              <TextField
                fullWidth
                label="Коэффициент потери влаги при выпечке"
                type="number"
                value={koef}
                onChange={(e) => onChange('koef', e.target.value)}
                size="small"
                slotProps={{
                  input: {
                    inputProps: { min: 0, max: 0.99, step: 0.01 },
                    autoComplete: 'off',
                  },
                }}
                helperText="Например, 0.85 означает, что продукт теряет 85% веса при выпечке"
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
            Отмена
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
          >
            {editingId ? 'Обновить продукт' : 'Создать продукт'}
          </Button>
        </Box>
      </Stack>
    </form>
  )
}
