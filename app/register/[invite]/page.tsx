'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { signInAction } from '../../actions/auth'
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
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import LoginIcon from '@mui/icons-material/Login'
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
  const [mode, setMode] = useState<'register' | 'login'>('register')
  const [subscribing, setSubscribing] = useState(false)
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const isBaker = type === 'BAKER'
  const isLoggedIn = status === 'authenticated'

  useEffect(() => {
    fetch(`/api/register?invite=${invite}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setType(data?.type ?? null))
      .catch(() => setType(null))
      .finally(() => setLoading(false))
  }, [invite])

  const handleSubscribeLoggedIn = async () => {
    setSubscribing(true)
    setError(null)
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invite }),
    })
    if (res.ok) {
      router.push('/customer')
    } else {
      try {
        setError((await res.json()).error)
      } catch {
        setError('Ошибка подписки')
      }
      setSubscribing(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget as HTMLFormElement)
    const email = fd.get('email') as string
    const password = fd.get('password') as string

    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invite, email, password }),
    })

    if (res.ok) {
      const result = await signInAction({ email, password })
      if (result?.error) {
        setError(result.error)
      } else {
        await update()
        router.push('/customer')
      }
    } else {
      try {
        setError((await res.json()).error)
      } catch {
        setError('Ошибка входа')
      }
    }
  }

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
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {isBaker
                ? 'Регистрация пекаря'
                : 'Присоединиться к пекарне'}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {isBaker
                ? 'Создайте аккаунт пекаря, чтобы управлять своей пекарней'
                : isLoggedIn
                  ? 'Подпишитесь на этого пекаря, чтобы получать уведомления'
                  : 'Зарегистрируйтесь или войдите, чтобы подписаться на пекаря'}
            </Typography>
          </Box>

          {isBaker ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                setError(null)
                const fd = new FormData(e.currentTarget)
                const body = Object.fromEntries(fd.entries())

                const res = await fetch('/api/register', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...body, invite }),
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
                <TextField fullWidth name="name" label="Имя" type="text" required variant="outlined" />
                <TextField fullWidth name="phone" label="Телефон" type="tel" required variant="outlined" />
                <TextField fullWidth name="email" label="Email" type="email" required variant="outlined" />
                <TextField fullWidth name="password" label="Пароль" type="password" required variant="outlined" />
                {error && <Alert severity="error">{error}</Alert>}
                <Button type="submit" variant="contained" size="large" fullWidth startIcon={<BakeryDiningIcon />}>
                  Зарегистрироваться как пекарь
                </Button>
              </Stack>
            </form>
          ) : isLoggedIn ? (
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleSubscribeLoggedIn}
                disabled={subscribing}
              >
                {subscribing ? 'Подписываем...' : 'Подписаться на пекаря'}
              </Button>
            </Stack>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <ToggleButtonGroup
                  value={mode}
                  exclusive
                  onChange={(_, v) => v && setMode(v)}
                  size="small"
                >
                  <ToggleButton value="register">
                    <PersonAddIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Регистрация
                  </ToggleButton>
                  <ToggleButton value="login">
                    <LoginIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Вход
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {mode === 'register' ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    setError(null)
                    const fd = new FormData(e.currentTarget)
                    const body = Object.fromEntries(fd.entries())

                    const res = await fetch('/api/register', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ ...body, invite }),
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
                    <TextField fullWidth name="name" label="Имя" type="text" required variant="outlined" />
                    <TextField fullWidth name="phone" label="Телефон" type="tel" required variant="outlined" />
                    <TextField fullWidth name="email" label="Email" type="email" required variant="outlined" />
                    <TextField fullWidth name="password" label="Пароль" type="password" required variant="outlined" />
                    {error && <Alert severity="error">{error}</Alert>}
                    <Button type="submit" variant="contained" size="large" fullWidth startIcon={<PersonAddIcon />}>
                      Зарегистрироваться
                    </Button>
                  </Stack>
                </form>
              ) : (
                <form onSubmit={handleLogin}>
                  <Stack spacing={2}>
                    <TextField fullWidth name="email" label="Email" type="email" required variant="outlined" />
                    <TextField fullWidth name="password" label="Пароль" type="password" required variant="outlined" />
                    {error && <Alert severity="error">{error}</Alert>}
                    <Button type="submit" variant="contained" size="large" fullWidth startIcon={<LoginIcon />}>
                      Войти и подписаться
                    </Button>
                  </Stack>
                </form>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}
