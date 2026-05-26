'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Avatar,
} from '@mui/material'
import EventNoteIcon from '@mui/icons-material/EventNote'
import CakeIcon from '@mui/icons-material/Cake'
import NutritionDisplay from '@/app/components/NutritionDisplay'
import type { GroupedBooking } from '@/app/types'

export default function CustomerBookingsPage() {
  const { data: session, status } = useSession()
  const [bookings, setBookings] = useState<GroupedBooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.role === 'CUSTOMER') {
      fetch('/api/bookings')
        .then((r) => (r.ok ? r.json() : []))
        .then(setBookings)
        .finally(() => setLoading(false))
    }
  }, [session])

  if (status === 'loading' || status === 'unauthenticated' || !session) {
    return (
      <Container
        maxWidth="md"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Container>
    )
  }

  if (session.user?.role !== 'CUSTOMER') {
    return (
      <Container maxWidth="md" sx={{ pt: 4 }}>
        <Alert severity="error">Пожалуйста, войдите как покупатель.</Alert>
      </Container>
    )
  }

  const totalAmount = (booking: GroupedBooking) =>
    booking.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 700 }}>
        Мои брони
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : bookings.length === 0 ? (
        <Alert severity="info">Броней пока нет. Просмотрите посты, чтобы найти вкусные угощения!</Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {bookings.map((booking) => (
            <Card key={booking.postId} sx={{ borderRadius: 2, boxShadow: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Avatar
                        src={booking.baker.avatar || undefined}
                        sx={{ width: 56, height: 56, bgcolor: 'secondary.main' }}
                      >
                        {booking.baker.name?.[0] || 'B'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {booking.postTitle}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          от {booking.baker.name || 'Пекаря'}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={`${totalAmount(booking).toFixed(2)} ₽`}
                      color="primary"
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>

                  {booking.postDescription && (
                    <Typography variant="body2" color="text.secondary">
                      {booking.postDescription}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventNoteIcon fontSize="small" color="primary" />
                    <Typography variant="body2">
                      Самовывоз:{' '}
                      <strong>
                        {new Date(booking.pickupDate).toLocaleDateString('ru-RU', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </strong>
                    </Typography>
                  </Box>

                  <Divider />

                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Заказанные товары ({booking.items.length}):
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {booking.items.map((item) => (
                      <Box
                        key={item.id}
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          bgcolor: 'grey.50',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
                            {item.product.photo ? (
                              <Box
                                component="img"
                                src={item.product.photo}
                                alt={item.product.name}
                                sx={{
                                  width: 60,
                                  height: 60,
                                  borderRadius: 1,
                                  objectFit: 'cover',
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: 60,
                                  height: 60,
                                  borderRadius: 1,
                                  bgcolor: 'primary.light',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <CakeIcon sx={{ fontSize: 30, color: 'white' }} />
                              </Box>
                            )}
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {item.product.name}
                              </Typography>
                              {item.product.description && (
                                <Typography variant="body2" color="text.secondary">
                                  {item.product.description}
                                </Typography>
                              )}
                              {item.product.ingredients && (
                                <Typography variant="caption" color="text.secondary">
                                  {item.product.ingredients}
                                </Typography>
                              )}
                              {(item.product.kcal || item.product.protein || item.product.fat || item.product.carbs) && (
                                <Box sx={{ mt: 1 }}>
                                  <NutritionDisplay
                                    kcal={item.product.kcal}
                                    protein={item.product.protein}
                                    fat={item.product.fat}
                                    carbs={item.product.carbs}
                                    showLabel={false}
                                    size="small"
                                  />
                                </Box>
                              )}
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                            <Typography variant="body2">
                              x{item.quantity}
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {(item.price * item.quantity).toFixed(2)} ₽
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Забронировано: {new Date(booking.createdAt).toLocaleString('ru-RU')}
                    </Typography>
                    <Typography variant="body2">
                      Итого: <strong>{booking.items.reduce((s, i) => s + i.quantity, 0)} шт.</strong>
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  )
}