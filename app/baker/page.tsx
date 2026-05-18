'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Stack,
  CircularProgress,
  Paper,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import AddLinkIcon from '@mui/icons-material/AddLink'

export default function BakerDashboard() {
  const { data: session, status } = useSession()
  const [invite, setInvite] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (status === 'loading' || status === 'unauthenticated')
    return <CircularProgress sx={{ mt: 4 }} />
  if (session.user?.role !== 'BAKER') {
    return (
      <Alert severity="error">
        Нет доступа. <a href="/signin">Войти</a>
      </Alert>
    )
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
            🍰 Панель пекаря
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Добро пожаловать, {session.user.email}
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Создать реферальную ссылку
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Создавайте ссылки-приглашения для покупателей, чтобы они могли зарегистрироваться и автоматически подписаться на ваши посты.
          </Typography>
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={
              loading ? <CircularProgress size={20} /> : <AddLinkIcon />
            }
            onClick={async () => {
              setInvite(null)
              setError(null)
              setLoading(true)
              try {
                const res = await fetch('/api/invite', { method: 'POST' })
                if (res.ok) {
                  setInvite((await res.json()).inviteUrl)
                } else {
                  try {
                    setError((await res.json()).error)
                  } catch {
                    setError('Не удалось создать ссылку')
                  }
                }
              } catch (err) {
                setError('Не удалось создать ссылку')
              } finally {
                setLoading(false)
              }
            }}
            disabled={loading}
          >
            Создать ссылку
          </Button>

          {invite && (
            <Paper
              sx={{
                mt: 3,
                p: 2,
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
              }}
            >
              <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                Поделитесь этой ссылкой с покупателями:
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  p: 2,
                  borderRadius: 1,
                  wordBreak: 'break-all',
                }}
              >
                <code style={{ flex: 1 }}>{invite}</code>
                <Button
                  size="small"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => {
                    navigator.clipboard.writeText(invite)
                  }}
                  sx={{ color: 'inherit' }}
                >
                  Копировать
                </Button>
              </Box>
            </Paper>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
