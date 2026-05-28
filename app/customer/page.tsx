'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Stack,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import StorefrontIcon from '@mui/icons-material/Storefront'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import NutritionDisplay from '@/app/components/NutritionDisplay'
import { calculateKBJU } from '@/lib/nutrition'
import type { Post, NutritionInfo, IngredientBasic } from '@/app/types'

function NutritionInfoComponent({
  nutrition,
  ingredients,
  koef,
}: {
  nutrition: NutritionInfo
  koef?: number | null
  ingredients?: { weight: number | null; ingredient: { kcal: number | null; protein: number | null; fat: number | null; carbs: number | null } }[]
}) {
  const calculated = ingredients && ingredients.length > 0
    ? calculateKBJU(ingredients, koef)
    : null
  const display = calculated?.kcal != null ? calculated : nutrition
  return (
    <Box sx={{ mt: 1 }}>
      <NutritionDisplay
        kcal={display.kcal}
        protein={display.protein}
        fat={display.fat}
        carbs={display.carbs}
        showLabel={false}
        size="small"
      />
    </Box>
  )
}

function IngredientsList({ ingredients, productId }: { ingredients: IngredientBasic[]; productId?: string }) {
  if (ingredients.length === 0) return null
  return (
    <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
      {ingredients.slice(0, 6).map((ing) => (
        <Chip
          key={`${productId || ''}-${ing.id}`}
          label={`${ing.ingredient.name}${ing.weight ? ` (${ing.weight}${ing.metric || 'г'})` : ''}`}
          size="small"
          variant="outlined"
        />
      ))}
      {ingredients.length > 6 && (
        <Chip
          label={`+${ingredients.length - 6}`}
          size="small"
          variant="outlined"
        />
      )}
    </Stack>
  )
}

function QuantitySelector({
  quantity,
  available,
  onChange,
}: {
  quantity: number
  available: number
  onChange: (qty: number) => void
}) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      <Button
        size="small"
        variant="outlined"
        disabled={quantity <= 0}
        onClick={() => onChange(quantity - 1)}
        sx={{ minWidth: 32, p: 0.5 }}
      >
        -
      </Button>
      <Typography sx={{ minWidth: 24, textAlign: 'center' }}>
        {quantity}
      </Typography>
      <Button
        size="small"
        variant="outlined"
        disabled={quantity >= available}
        onClick={() => onChange(quantity + 1)}
        sx={{ minWidth: 32, p: 0.5 }}
      >
        +
      </Button>
    </Stack>
  )
}

export default function CustomerPage() {
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [bookingPostId, setBookingPostId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.role === 'CUSTOMER') {
      loadPosts()
    }
  }, [session])

  function loadPosts() {
    setLoading(true)
    fetch('/api/posts')
      .then((res) => (res.ok ? res.json() : []))
      .then(setPosts)
      .finally(() => setLoading(false))
  }

  const updateQuantity = (postProductId: string, qty: number) => {
    setQuantities((prev) => ({ ...prev, [postProductId]: qty }))
  }

  const handleBulkBooking = async (postId: string) => {
    const postProducts = posts.find((p) => p.id === postId)?.products || []
    const items = postProducts
      .filter((pp) => quantities[pp.id] > 0)
      .map((pp) => ({ postProductId: pp.id, quantity: quantities[pp.id] }))

    if (items.length === 0) return

    setError(null)
    setSuccess(null)
    setBookingPostId(postId)

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    })

    if (res.ok) {
      setSuccess('Бронь оформлена!')
      setQuantities({})
      setBookingPostId(null)
      loadPosts()
    } else {
      const data = await res.json()
      setError(data.error || 'Ошибка бронирования')
      setBookingPostId(null)
    }
  }

  const getTotalItems = (postId: string) => {
    const post = posts.find((p) => p.id === postId)
    if (!post) return 0
    return post.products.reduce((sum, pp) => sum + (quantities[pp.id] || 0), 0)
  }

  const getTotalPrice = (postId: string) => {
    const post = posts.find((p) => p.id === postId)
    if (!post) return 0
    return post.products.reduce(
      (sum, pp) => sum + (quantities[pp.id] || 0) * pp.price,
      0
    )
  }

  if (status === 'loading' || status === 'unauthenticated') {
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

  if (session?.user?.role !== 'CUSTOMER') {
    return (
      <Container maxWidth="md" sx={{ pt: 4 }}>
        <Alert severity="error">Пожалуйста, войдите как покупатель.</Alert>
      </Container>
    )
  }

  const isExpired = (date: string) => new Date(date) < new Date()
  const activePosts = posts.filter((p) => !isExpired(p.pickupDate))

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          🍰 Свежее от ваших пекарей
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Просматривайте и заказывайте вкусные угощения от любимых пекарей
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : activePosts.length === 0 ? (
        <Alert severity="info">Активных постов пока нет. Загляните позже! 👨‍🍳</Alert>
      ) : (
        <Stack spacing={4}>
          {activePosts.map((post) => (
            <Card key={post.id}>
              <Box sx={{ p: 0 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{
                      alignItems: 'center',
                      bgcolor: 'grey.100',
                      py: 2,
                      px: 3,
                      borderRadius: 0,
                    }}
                  >
                    <StorefrontIcon sx={{ color: 'primary.main' }} />
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, color: 'text.secondary' }}
                    >
                      {post.bakerProfile.user.name || 'Местный пекарь'}
                    </Typography>
                    <Divider orientation="vertical" flexItem />
                    <CalendarMonthIcon
                      sx={{ fontSize: 18, color: 'text.secondary' }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Самовывоз: {new Date(post.pickupDate).toLocaleString('ru-RU')}
                    </Typography>
                  </Stack>
                </Box>

                <Box sx={{ px: 3, pb: 3, mt: 3 }}>
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{ fontWeight: 700, mb: 0.5 }}
                  >
                    🍰 {post.title}
                  </Typography>
                  {post.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      {post.description}
                    </Typography>
                  )}

                  {post.products.length > 0 && (
                    <Stack spacing={2}>
                      {post.products.map((pp) => (
                        <Card key={pp.id} variant="outlined">
                          <CardContent sx={{ p: 2.5 }}>
                            <Stack
                              direction={{ xs: 'column', md: 'row' }}
                              spacing={3}
                            >
                              {pp.product.photo && (
                                <Box
                                  component="img"
                                  src={pp.product.photo}
                                  alt={pp.product.name}
                                  sx={{
                                    width: { xs: '100%', md: 140 },
                                    height: { xs: 160, md: 140 },
                                    objectFit: 'cover',
                                    borderRadius: 2,
                                  }}
                                />
                              )}
                              <Box sx={{ flex: 1 }}>
                                <Stack
                                  direction="row"
                                  sx={{
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                  }}
                                >
                                  <Box>
                                    <Typography
                                      variant="h6"
                                      sx={{ fontWeight: 700 }}
                                    >
                                      {pp.product.name}
                                    </Typography>
                                    {pp.product.description && (
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mt: 0.5 }}
                                      >
                                        {pp.product.description}
                                      </Typography>
                                    )}
                                  </Box>
                                  <Chip
                                    label={`${pp.price.toFixed(2)} ₽`}
                                    color="primary"
                                    sx={{ fontWeight: 700, fontSize: '1.1rem' }}
                                  />
                                </Stack>

                                <NutritionInfoComponent nutrition={pp.product} ingredients={pp.product.ingredients} koef={pp.product.koef} />
                                <IngredientsList
                                  ingredients={pp.product.ingredients}
                                  productId={pp.product.id}
                                />

                                <Divider sx={{ my: 2 }} />

                                <Stack
                                  direction="row"
                                  sx={{
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                  }}
                                >
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{ alignItems: 'center' }}
                                  >
                                    <RestaurantIcon
                                      sx={{
                                        fontSize: 16,
                                        color: 'text.secondary',
                                      }}
                                    />
                                    <Typography
                                      variant="body2"
                                      color={
                                        pp.availableQuantity === 0
                                          ? 'error'
                                          : 'text.secondary'
                                      }
                                    >
                                      {pp.availableQuantity > 0
                                        ? `${pp.availableQuantity} из ${pp.totalQuantity} доступно`
                                        : '❌ Распродано'}
                                    </Typography>
                                  </Stack>
                                  {pp.availableQuantity > 0 && (
                                    <QuantitySelector
                                      quantity={quantities[pp.id] || 0}
                                      available={pp.availableQuantity}
                                      onChange={(qty) =>
                                        updateQuantity(pp.id, qty)
                                      }
                                    />
                                  )}
                                </Stack>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                      {getTotalItems(post.id) > 0 && (
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<ShoppingCartIcon />}
                          onClick={() => handleBulkBooking(post.id)}
                          disabled={bookingPostId === post.id}
                          sx={{ py: 1.5, fontWeight: 700 }}
                        >
                          Заказать ({getTotalItems(post.id)} шт.) — {getTotalPrice(post.id).toFixed(2)} ₽
                        </Button>
                      )}
                    </Stack>
                  )}
                </Box>
              </Box>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  )
}
