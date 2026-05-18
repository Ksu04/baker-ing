'use client'
import { Box, Card, CardContent, Typography } from '@mui/material'

export default function PostHeader() {
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
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700 }}>
            📝 Управление постами
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Создавайте и управляйте постами вашей пекарни
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}
