'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  CircularProgress,
} from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import BakeryDiningIcon from '@mui/icons-material/BakeryDining'

export default function RegisterInvitePage({
  params,
}: {
  params: Promise<{ invite: string }>
}) {
  const { invite } = React.use(params)

  const [error, setError] = useState<string | null>(null)
  const [type, setType] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const isBaker = type === 'BAKER'

  useEffect(() => {
    fetch(`/api/register?invite=${invite}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setType(data?.type ?? null))
      .catch(() => setType(null))
      .finally(() => setLoading(false))
  }, [invite])

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (!type) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 600, textAlign: 'center' }}>
              Недействительная ссылка
            </Typography>
          </CardContent>
        </Card>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            {isBaker ? (
              <BakeryDiningIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            ) : (
              <PersonAddIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            )}
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {isBaker ? 'Регистрация пекаря' : 'Регистрация покупателя'}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {isBaker
                ? 'Создайте аккаунт пекаря, чтобы управлять своей пекарней'
                : 'Завершите регистрацию, чтобы начать'}
            </Typography>
          </Box>

          <form
            onSubmit={async (e) => {
              e.preventDefault()
              setError(null)
              const fd = new FormData(e.currentTarget)
              const body = Object.fromEntries(fd.entries())

              const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...body, invite: invite }),
              })

              if (res.ok) {
                router.push('/signin')
              } else {
                try {
                  setError((await res.json()).error)
                } catch {
                  setError('Ошибка регистрации')
                }
              }
            }}
          >
            <input type="hidden" name="invite" value={invite} />
            <Stack spacing={2}>
              <TextField
                fullWidth
                name="name"
                label="Имя"
                type="text"
                required
                variant="outlined"
              />
              <TextField
                fullWidth
                name="phone"
                label="Телефон"
                type="tel"
                required
                variant="outlined"
              />
              <TextField
                fullWidth
                name="email"
                label="Email"
                type="email"
                required
                variant="outlined"
              />
              <TextField
                fullWidth
                name="password"
                label="Пароль"
                type="password"
                required
                variant="outlined"
              />
              {error && <Alert severity="error">{error}</Alert>}
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                startIcon={isBaker ? <BakeryDiningIcon /> : <PersonAddIcon />}
              >
                {isBaker ? 'Зарегистрироваться как пекарь' : 'Зарегистрироваться'}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Container>
  )
}
