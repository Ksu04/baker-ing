'use client'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import type { Product } from './types'
import NutritionDisplay from '@/app/components/NutritionDisplay'
import { calculateKBJU } from '@/lib/nutrition'

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
}

export default function ProductCard({
  product,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const calculated = calculateKBJU(product.ingredients, product.koef)

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <Box
        component="img"
        src={product.photo || '/default-product.svg'}
        alt={product.name}
        sx={{ width: '100%', height: 200, objectFit: 'cover' }}
      />
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
          {product.name}
        </Typography>
        {product.description && (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {product.description}
          </Typography>
        )}
        {(calculated.kcal || calculated.protein || calculated.fat || calculated.carbs) && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              bgcolor: 'background.default',
              borderRadius: 1,
            }}
          >
            <NutritionDisplay
              kcal={calculated.kcal}
              protein={calculated.protein}
              fat={calculated.fat}
              carbs={calculated.carbs}
              showLabel={true}
              size="small"
              variant="chips"
            />
          </Box>
        )}
        {product.ingredients.length > 0 ? (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              bgcolor: 'background.default',
              borderRadius: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                display: 'block',
                mb: 1,
                color: 'text.secondary',
              }}
            >
              Ингредиенты ({product.ingredients.length}):
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {product.ingredients.map((i) => (
                <Chip
                  key={i.ingredientId}
                  label={`${i.weight ?? 0}${i.metric || 'g'} ${i.ingredient?.name}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
            </Box>
          </Box>
        ) : (
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ mb: 2, fontStyle: 'italic' }}
          >
            Ингредиенты не добавлены
          </Typography>
        )}
        <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => onEdit(product)}
            sx={{ flex: 2 }}
          >
            Редактировать
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDelete(product.id)}
            sx={{ flex: 1 }}
          >
            Удалить
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
