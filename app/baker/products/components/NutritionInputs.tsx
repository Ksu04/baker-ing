'use client'
import { Stack, TextField, Typography, Paper } from '@mui/material'
import InputAdornment from '@mui/material/InputAdornment'

interface NutritionInputsProps {
  kcal: string
  protein: string
  fat: string
  carbs: string
  onKcalChange: (value: string) => void
  onProteinChange: (value: string) => void
  onFatChange: (value: string) => void
  onCarbsChange: (value: string) => void
}

export default function NutritionInputs({
  kcal,
  protein,
  fat,
  carbs,
  onKcalChange,
  onProteinChange,
  onFatChange,
  onCarbsChange,
}: NutritionInputsProps) {
  const preventWheelScroll = (e: React.KeyboardEvent | React.FocusEvent) => {
    if ('key' in e && ['ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault()
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 700,
          mb: 2,
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          color: 'primary.main',
        }}
      >
        КБЖУ (на 100г)
      </Typography>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Ккал"
            type="number"
            size="small"
            value={kcal}
            onChange={(e) => onKcalChange(e.target.value)}
            onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
            onKeyDown={preventWheelScroll}
            fullWidth
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">ккал</InputAdornment>
                ),
                autoComplete: 'off',
              },
            }}
          />
          <TextField
            label="Белки"
            type="number"
            size="small"
            value={protein}
            onChange={(e) => onProteinChange(e.target.value)}
            onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
            onKeyDown={preventWheelScroll}
            fullWidth
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">г</InputAdornment>,
                autoComplete: 'off',
              },
            }}
          />
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Жиры"
            type="number"
            size="small"
            value={fat}
            onChange={(e) => onFatChange(e.target.value)}
            onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
            onKeyDown={preventWheelScroll}
            fullWidth
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">г</InputAdornment>,
                autoComplete: 'off',
              },
            }}
          />
          <TextField
            label="Углеводы"
            type="number"
            size="small"
            value={carbs}
            onChange={(e) => onCarbsChange(e.target.value)}
            onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
            onKeyDown={preventWheelScroll}
            fullWidth
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">г</InputAdornment>,
                autoComplete: 'off',
              },
            }}
          />
        </Stack>
      </Stack>
    </Paper>
  )
}
