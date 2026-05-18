'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Box, Card, CardContent, Typography, Button, Alert, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  ToggleButtonGroup, ToggleButton,
} from '@mui/material'
import AddLinkIcon from '@mui/icons-material/AddLink'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import BakeryDiningIcon from '@mui/icons-material/BakeryDining'

interface InviteToken {
  id: string
  code: string
  type: string
  createdAt: string
  active: boolean
}

export default function InvitesPage() {
  const { data: session, status } = useSession()
  const [invites, setInvites] = useState<InviteToken[]>([])
  const [error, setError] = useState<string | null>(null)
  const [inviteType, setInviteType] = useState<string>('CUSTOMER')

  useEffect(() => {
    if (session?.user?.role === 'BAKER') {
      fetch('/api/invite')
        .then((r) => (r.ok ? r.json() : []))
        .then(setInvites)
    }
  }, [session])

  const generateLink = async () => {
    setError(null)
    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: inviteType }),
    })
    if (res.ok) {
      const { inviteUrl } = await res.json()
      const updated = await fetch('/api/invite').then((r) => (r.ok ? r.json() : []))
      setInvites(updated)
      navigator.clipboard.writeText(inviteUrl)
      alert('Ссылка скопирована!')
    } else {
      try {
        const text = await res.text()
        setError(`Ошибка ${res.status}: ${text || 'пустой ответ'}`)
      } catch {
        setError(`Ошибка ${res.status}: неизвестная ошибка`)
      }
    }
  }

  const toggleActive = async (id: string, currentActive: boolean) => {
    await fetch(`/api/invite?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !currentActive }),
    })
    setInvites(
      invites.map((i) => (i.id === id ? { ...i, active: !currentActive } : i))
    )
  }

  const deleteInvite = async (id: string) => {
    if (!confirm('Удалить эту ссылку?')) return
    await fetch(`/api/invite?id=${id}`, { method: 'DELETE' })
    setInvites(invites.filter((i) => i.id !== id))
  }

  if (status === 'loading' || status === 'unauthenticated')
    return <CircularProgress sx={{ mt: 4 }} />
  if (session.user?.role !== 'BAKER') {
    return <Alert severity="error">Нет доступа</Alert>
  }

  return (
    <Box>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
            Реферальные ссылки
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <ToggleButtonGroup
              value={inviteType}
              exclusive
              onChange={(_, val) => val && setInviteType(val)}
              size="small"
            >
              <ToggleButton value="CUSTOMER" sx={{ textTransform: 'none' }}>
                <PersonAddIcon sx={{ mr: 0.5 }} fontSize="small" />
                Для покупателя
              </ToggleButton>
              <ToggleButton value="BAKER" sx={{ textTransform: 'none' }}>
                <BakeryDiningIcon sx={{ mr: 0.5 }} fontSize="small" />
                Для пекаря
              </ToggleButton>
            </ToggleButtonGroup>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddLinkIcon />}
              onClick={generateLink}
            >
              Создать ссылку
            </Button>
          </Box>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </CardContent>
      </Card>

      {invites.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#FFECB7' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Код</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Тип</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Создана</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Активна</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invites.map((invite) => (
                <TableRow key={invite.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{invite.code}</TableCell>
                  <TableCell>
                    {invite.type === 'BAKER' ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <BakeryDiningIcon fontSize="small" sx={{ color: 'primary.main' }} />
                        Пекарь
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PersonAddIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        Покупатель
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>{new Date(invite.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    {invite.active ? 'Да' : 'Нет'}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => toggleActive(invite.id, invite.active)}
                      sx={{ mr: 1 }}
                    >
                      {invite.active ? 'Отключить' : 'Включить'}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => deleteInvite(invite.id)}
                    >
                      Удалить
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="textSecondary">
              Ссылок пока нет. Создайте первую, чтобы поделиться с покупателями или пригласить другого пекаря.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
