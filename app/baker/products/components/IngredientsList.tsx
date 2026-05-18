'use client'
import { Box, TextField, Typography, Button, Alert, Paper } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import InputAdornment from '@mui/material/InputAdornment'
import type { Ingredient, SelectedIngredient } from './types'

interface IngredientsListProps {
  ingredients: Ingredient[]
  selectedIngredients: SelectedIngredient[]
  ingredientWeights: { [key: string]: string }
  onAddIngredient: (
    ingredientId: string,
    weight: number,
    metric: string
  ) => void
  onRemoveIngredient: (ingredientId: string) => void
  onWeightChange: (ingredientId: string, weight: string) => void
}

export default function IngredientsList({
  ingredients,
  selectedIngredients,
  ingredientWeights,
  onAddIngredient,
  onRemoveIngredient,
  onWeightChange,
}: IngredientsListProps) {
  return (
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            color: '#000000',
          }}
        >
          🥯 Select Ingredients
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {selectedIngredients.length} selected
        </Typography>
      </Box>

      {ingredients.length === 0 ? (
        <Alert severity="warning" sx={{ mb: 2, bgcolor: '#FFECB7', color: '#000000' }}>
          No ingredients available. Create some in the Ingredients section
          first.
        </Alert>
      ) : (
        <Box
          sx={{
            maxHeight: 350,
            overflowY: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          {ingredients.map((ing) => {
            const isSelected = selectedIngredients.find(
              (i) => i.ingredientId === ing.id
            )
            const weightValue = ingredientWeights[ing.id] || ''

            return (
              <Box
                key={ing.id}
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: isSelected ? 'action.selected' : 'transparent',
                  '&:last-child': { borderBottom: 'none' },
                  '&:hover': { bgcolor: 'action.hover' },
                  transition: 'background-color 0.2s',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, minWidth: 120 }}
                  >
                    🌾 {ing.name}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'stretch',
                    gap: 1,
                    flexShrink: 0,
                  }}
                >
                  <TextField
                    type="number"
                    placeholder="0"
                    size="small"
                    value={weightValue}
                    onChange={(e) => onWeightChange(ing.id, e.target.value)}
                    onBlur={(e) => {
                      const weight = parseFloat(e.target.value)
                      if (!isNaN(weight) && weight > 0) {
                        onAddIngredient(ing.id, weight, ing.metric)
                      }
                    }}
                    onWheel={(e) =>
                      e.target instanceof HTMLElement && e.target.blur()
                    }
                    onKeyDown={(e) =>
                      ['ArrowUp', 'ArrowDown'].includes(e.key) &&
                      e.preventDefault()
                    }
                    sx={{ width: 90 }}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            {ing.metric}
                          </InputAdornment>
                        ),
                        autoComplete: 'off',
                      },
                    }}
                  />
                  <Button
                    size="small"
                    variant={isSelected ? 'contained' : 'outlined'}
                    color={isSelected ? 'error' : 'primary'}
                    onClick={() => {
                      if (isSelected) {
                        onRemoveIngredient(ing.id)
                      } else {
                        const weight = parseFloat(weightValue)
                        if (!isNaN(weight) && weight > 0) {
                          onAddIngredient(ing.id, weight, ing.metric)
                        }
                      }
                    }}
                    sx={{ minWidth: 32 }}
                  >
                    {isSelected ? (
                      <RemoveCircleIcon sx={{ fontSize: '1rem' }} />
                    ) : (
                      <AddIcon sx={{ fontSize: '1rem' }} />
                    )}
                  </Button>
                </Box>
              </Box>
            )
          })}
        </Box>
      )}
    </Paper>
  )
}
