'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowBack as ArrowBackIcon,
  EventNote as EventNoteIcon,
  Person as PersonIcon,
} from '@mui/icons-material'
import {
  Container,
  Box,
  Card,
  CardContent,
  Button,
  Stack,
  Typography,
  Alert,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'

interface PostProduct {
  id: string
  productId: string
  price: number
  totalQuantity: number
  availableQuantity: number
  product: {
    name: string
    description: string | null
    photo: string | null
  }
  bookings: {
    id: string
    quantity: number
    createdAt: string
    customer: {
      name: string | null
      email: string
      phone: string | null
    }
  }[]
}

interface PostDetail {
  id: string
  title: string
  description: string | null
  pickupDate: string
  products: PostProduct[]
}

export default function PostDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [post, setPost] = useState<PostDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const postId = params.id as string

  useEffect(() => {
    if (session?.user?.role === 'BAKER' && postId) {
      fetch(`/api/posts/${postId}`)
        .then((r) => (r.ok ? r.json() : { error: 'Ошибка загрузки' }))
        .then((data) => {
          if (data.error) {
            setError(data.error)
          } else {
            setPost(data)
          }
          setLoading(false)
        })
        .catch(() => {
          setError('Не удалось загрузить пост')
          setLoading(false)
        })
    }
  }, [session, postId])

  if (status === 'loading' || status === 'unauthenticated' || loading) {
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

  if (session?.user?.role !== 'BAKER') {
    return (
      <Container maxWidth="md" sx={{ pt: 4 }}>
        <Alert severity="error">Нет доступа</Alert>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ pt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/baker/posts')}
          sx={{ mt: 2 }}
        >
          Назад к постам
        </Button>
      </Container>
    )
  }

  if (!post) {
    return (
      <Container maxWidth="md" sx={{ pt: 4 }}>
        <Alert severity="info">Пост не найден</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/baker/posts')}
          sx={{ mt: 2 }}
        >
          Назад к постам
        </Button>
      </Container>
    )
  }

  const isExpired = new Date(post.pickupDate) < new Date()
  const totalBookings = post.products.reduce(
    (sum, pp) => sum + pp.bookings.reduce((s, b) => s + b.quantity, 0),
    0
  )
  const totalQuantity = post.products.reduce(
    (sum, pp) => sum + pp.totalQuantity,
    0
  )

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push('/baker/posts')}
        sx={{ mb: 3 }}
      >
        Назад к постам
      </Button>

      <Card sx={{ mb: 4, opacity: isExpired ? 0.6 : 1 }}>
        <CardContent>
          <Stack
            direction="row"
            sx={{ mb: 2, alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Box>
              <Stack
                direction="row"
                spacing={1}
                sx={{ mb: 1, alignItems: 'center', }}
              >
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{ fontWeight: 'bold' }}
                >
                  {post.title}
                </Typography>
                  {isExpired && (
                  <Chip label="Просрочен" color="error" size="small" />
                )}
              </Stack>
              <Stack
                direction="row"
                spacing={1}
                sx={{ color: 'text.secondary', alignItems: 'center', }}
              >
                <EventNoteIcon fontSize="small" />
                <Typography variant="body2">
                  {new Date(post.pickupDate).toLocaleString('ru-RU')}
                </Typography>
              </Stack>
            </Box>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography
                  variant="h6"
                  color="#000000"
                  sx={{ fontWeight: 'bold' }}
                >
                  {totalBookings} / {totalQuantity}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  брони / всего
                </Typography>
              </Box>
            </Stack>
          </Stack>
          {post.description && (
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {post.description}
            </Typography>
          )}
        </CardContent>
      </Card>

      <Stack spacing={4}>
        {post.products.map((pp) => {
          const productBookings = pp.bookings
          const booked = productBookings.reduce((s, b) => s + b.quantity, 0)

          return (
            <Card key={pp.id}>
              <CardContent>
                <Stack
                  direction="row"
                  sx={{ mb: 2, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {pp.product.photo && (
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: 1,
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={pp.product.photo}
                          alt={pp.product.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </Box>
                    )}
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {pp.product.name}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        color="#000000"
                        sx={{ fontWeight: 'bold' }}
                      >
                        {pp.price.toFixed(2)} ₽
                      </Typography>
                    </Box>
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      забронировано: {booked} / {pp.totalQuantity}
                    </Typography>
                    {pp.availableQuantity === 0 && (
                      <Chip
                        label="Распродано"
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </Stack>

                {productBookings.length === 0 ? (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Броней на этот продукт пока нет.
                    </Alert>
                  ) : (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.100' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>
                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{ alignItems: 'center', }}
                            >
                              <PersonIcon fontSize="small" />
                              Покупатель
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }} align="center">
                            Количество
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }} align="right">
                            Время брони
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {productBookings.map((booking) => (
                          <TableRow key={booking.id} hover>
                            <TableCell>
                              <Typography
                  variant="body1"
                  sx={{ color: 'text.secondary' }}
                >
                  {post.description}
                </Typography>
              )}
            </CardContent>
          </Card>
          )
        })}
      </Stack>
    </Container>
  )
}
