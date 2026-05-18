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
          No Products Yet
        </Typography>
        <Typography color="textSecondary">
          Create your first product above to get started!
        </Typography>
      </CardContent>
    </Card>
  )
}
