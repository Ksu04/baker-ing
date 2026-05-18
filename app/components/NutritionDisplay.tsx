'use client'
import { Box, Typography, Chip } from '@mui/material'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import WaterDropIcon from '@mui/icons-material/WaterDrop'
import GrainIcon from '@mui/icons-material/Grain'

interface NutritionDisplayProps {
  kcal?: number | null
  protein?: number | null
  fat?: number | null
  carbs?: number | null
  showLabel?: boolean
  size?: 'small' | 'medium'
  variant?: 'chips' | 'inline'
}

export default function NutritionDisplay({
  kcal,
  protein,
  fat,
  carbs,
  showLabel = true,
  size = 'small',
  variant = 'chips',
}: NutritionDisplayProps) {
  if (!kcal && !protein && !fat && !carbs) return null

  const chipSize = size === 'small' ? 'small' : 'medium'
  const fontSize = size === 'small' ? '0.7rem' : '0.8rem'

  if (variant === 'inline') {
    return (
      <Box>
        {showLabel && (
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
            КБЖУ (на 100г):
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', fontSize }}>
          {kcal && (
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              🔥 {kcal} ккал
            </Typography>
          )}
          {protein && (
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              💪 {protein}г бел
            </Typography>
          )}
          {fat && (
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              🧈 {fat}г жир
            </Typography>
          )}
          {carbs && (
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              🍞 {carbs}г угл
            </Typography>
          )}
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {showLabel && (
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, width: '100%', mb: 0.5 }}>
          КБЖУ (на 100г):
        </Typography>
      )}
      {kcal && (
        <Chip
          icon={<LocalFireDepartmentIcon sx={{ fontSize: size === 'small' ? 14 : 16 }} />}
          label={`${kcal} ккал`}
          size={chipSize}
          color="error"
          variant="outlined"
          sx={{ fontSize }}
        />
      )}
      {protein && (
        <Chip
          icon={<FitnessCenterIcon sx={{ fontSize: size === 'small' ? 14 : 16 }} />}
          label={`Б: ${protein}г`}
          size={chipSize}
          color="success"
          variant="outlined"
          sx={{ fontSize }}
        />
      )}
      {fat && (
        <Chip
          icon={<WaterDropIcon sx={{ fontSize: size === 'small' ? 14 : 16 }} />}
          label={`Ж: ${fat}г`}
          size={chipSize}
          color="warning"
          variant="outlined"
          sx={{ fontSize }}
        />
      )}
      {carbs && (
        <Chip
          icon={<GrainIcon sx={{ fontSize: size === 'small' ? 14 : 16 }} />}
          label={`У: ${carbs}г`}
          size={chipSize}
          color="info"
          variant="outlined"
          sx={{ fontSize }}
        />
      )}
    </Box>
  )
}