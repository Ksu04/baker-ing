'use client'
import { Card, CardContent, Typography } from '@mui/material'

export default function ProductHeader() {
  return (
    <Card
      sx={{
        mb: 4,
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: '#000000',
      }}
    >
      <CardContent>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          🧁 Управление продуктами
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Создавайте продукты с ингредиентами, затем добавляйте их в посты.
        </Typography>
      </CardContent>
    </Card>
  )
}
