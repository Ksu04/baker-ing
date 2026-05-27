'use client'
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  Button,
  Divider,
} from '@mui/material'
import EventNoteIcon from '@mui/icons-material/EventNote'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'
import Link from 'next/link'
import type { PostWithProducts } from './types'
import NutritionDisplay from '@/app/components/NutritionDisplay'
import { calculateKBJU } from '@/lib/nutrition'

interface PostCardProps {
  post: PostWithProducts
  isExpired: (date: string) => boolean
  onDelete: (id: string) => void
}

export default function PostCard({ post, isExpired, onDelete }: PostCardProps) {
  return (
    <Card
      sx={{
        opacity: isExpired(post.pickupDate) ? 0.65 : 1,
        borderColor: isExpired(post.pickupDate) ? 'error.light' : 'divider',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'flex-start' },
            mb: 3,
          }}
          spacing={2}
        >
          <Box sx={{ flex: 1 }}>
            <Stack
              direction="row"
              sx={{ alignItems: 'center', mb: 1.5 }}
              spacing={1.5}
            >
              <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
                {post.title}
              </Typography>
              {isExpired(post.pickupDate) && (
                <Chip label="Просрочен" color="error" size="small" />
              )}
            </Stack>
            <Stack
              direction="row"
              sx={{ alignItems: 'center', mb: 2 }}
              spacing={1}
            >
              <EventNoteIcon fontSize="small" color="primary" />
              <Typography variant="body2">
                {new Date(post.pickupDate).toLocaleDateString('ru-RU', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Stack>
            {post.description && (
              <Typography
                variant="body2"
                sx={{ mb: 2, color: 'text.secondary' }}
              >
                {post.description}
              </Typography>
            )}
          </Box>
          <Stack direction={{ xs: 'row', sm: 'column' }} spacing={1}>
            <Button
              variant="contained"
              startIcon={<VisibilityIcon />}
              component={Link}
              href={`/baker/posts/${post.id}`}
              size="small"
            >
              Просмотр броней
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => onDelete(post.id)}
              size="small"
            >
              Удалить
            </Button>
          </Stack>
        </Stack>

        {post.products.length > 0 && (
          <Box>
            <Divider sx={{ my: 3 }} />
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                mb: 2.5,
                textTransform: 'uppercase',
                fontSize: '0.85rem',
                letterSpacing: '0.5px',
                color: 'text.secondary',
              }}
            >
              Продукты ({post.products.length})
            </Typography>
            <Stack spacing={2}>
              {post.products.map((pp) => (
                <Card key={pp.id} variant="outlined" sx={{ p: 2.5 }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    sx={{
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: 2.5,
                    }}
                    spacing={0}
                  >
                    {pp.product.photo && (
                      <Box
                        component="img"
                        src={pp.product.photo}
                        alt={pp.product.name}
                        sx={{
                          width: { xs: '100%', sm: 100 },
                          height: { xs: 200, sm: 100 },
                          objectFit: 'cover',
                          borderRadius: 1,
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Stack
                        direction="row"
                        sx={{
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 1,
                        }}
                        spacing={2}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700 }}
                        >
                          {pp.product.name}
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700, color: '#000000' }}
                        >
                          {pp.price.toFixed(2)} ₽
                        </Typography>
                      </Stack>
                      {pp.product.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1, mb: 1.5 }}
                        >
                          {pp.product.description}
                        </Typography>
                      )}
                      {(() => {
                        const c = calculateKBJU(pp.product.ingredients, pp.product.koef)
                        return (
                          <Box sx={{ mt: 1 }}>
                            <NutritionDisplay
                              kcal={c.kcal}
                              protein={c.protein}
                              fat={c.fat}
                              carbs={c.carbs}
                              showLabel={false}
                              size="small"
                            />
                          </Box>
                        )
                      })()}
                      <Stack
                        direction="row"
                        sx={{
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mt: 2,
                          pt: 1.5,
                          borderTop: 1,
                          borderColor: 'divider',
                        }}
                        spacing={2}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color:
                              pp.availableQuantity === 0
                                ? 'error.main'
                                : 'text.secondary',
                          }}
                        >
                          Доступно: <strong>{pp.availableQuantity}</strong> /{' '}
                          {pp.totalQuantity}
                        </Typography>
                        {pp.availableQuantity === 0 && (
                          <Chip label="Распродано" size="small" color="error" />
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
