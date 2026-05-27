'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  Divider,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'

export default function ProfileSettings() {
  const { data: session, update } = useSession()
  const user = session?.user

  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSaving(true)

    const body: Record<string, unknown> = {}
    if (name !== user?.name) body.name = name
    if (phone !== (user?.phone || '')) body.phone = phone
    if (newPassword) {
      body.currentPassword = currentPassword
      body.newPassword = newPassword
    }

    if (Object.keys(body).length === 0) {
      setSaving(false)
      return
    }

    const res = await fetch('/api/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      await update({ name, phone: phone || null })
    } else {
      try {
        setError((await res.json()).error)
      } catch {
        setError('Ошибка сохранения')
      }
    }
    setSaving(false)
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Настройки профиля
      </Typography>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Email"
                value={user?.email || ''}
                disabled
                variant="outlined"
                size="small"
                helperText="Email нельзя изменить"
              />

              <TextField
                fullWidth
                label="Имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="outlined"
                size="small"
              />

              <TextField
                fullWidth
                label="Телефон"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                variant="outlined"
                size="small"
              />

              <Divider />

              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Смена пароля
              </Typography>

              <TextField
                fullWidth
                label="Текущий пароль"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                variant="outlined"
                size="small"
              />

              <TextField
                fullWidth
                label="Новый пароль"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                variant="outlined"
                size="small"
                helperText={newPassword ? `Длина: ${newPassword.length} символов` : ''}
              />

              {error && <Alert severity="error">{error}</Alert>}
              {success && (
                <Alert severity="success">Профиль обновлён</Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                disabled={saving}
                sx={{ alignSelf: 'flex-start' }}
              >
                {saving ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}
