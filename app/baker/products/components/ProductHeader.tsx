'use client'
import { Card, CardContent, Typography } from '@mui/material'

export default function ProductHeader() {
  return (
    <Card
      sx={{
        mb: 4,
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
      }}
    >
      <CardContent>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          🧁 Product Manager
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Create reusable products with custom ingredients, then add them to
          posts.
        </Typography>
      </CardContent>
    </Card>
  )
}
