'use client'
import { Card, CardContent, Typography } from '@mui/material'

export default function EmptyProductsState() {
  return (
    <Card>
      <CardContent sx={{ textAlign: 'center', py: 6 }}>
        <Typography
          variant="h6"
          sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}
        >
          Продуктов пока нет
        </Typography>
        <Typography color="textSecondary">
          Создайте первый продукт выше, чтобы начать!
        </Typography>
      </CardContent>
    </Card>
  )
}
