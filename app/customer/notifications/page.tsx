'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  Box, Card, CardContent, Typography, Button, Alert,
  CircularProgress, Chip, List, ListItem, ListItemText,
  ListItemAvatar, Avatar,
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'

interface Subscription {
  id: string
  baker: {
    user: { name: string | null; email: string }
  }
  createdAt: string
}

interface PushSubInfo {
  id: string
  endpoint: string
  createdAt: string
  userAgent: string | null
}

export default function NotificationsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [pushSubs, setPushSubs] = useState<PushSubInfo[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    const [subRes, pushRes] = await Promise.all([
      fetch('/api/customer/subscriptions'),
      fetch('/api/push/subscribe'),
    ])
    if (subRes.ok) setSubscriptions(await subRes.json())
    if (pushRes.ok) {
      const data = await pushRes.json()
      setPushSubs(data.subscriptions ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const unsubscribe = async () => {
    for (const sub of pushSubs) {
      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      })
      try {
        const reg = await navigator.serviceWorker.getRegistration()
        const existing = await reg?.pushManager.getSubscription()
        if (existing) await existing.unsubscribe()
      } catch {}
    }
    await loadData()
  }

  const subscribe = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) return

    if (Notification.permission === 'denied') {
      alert('Уведомления заблокированы в настройках браузера. Разрешите их вручную.')
      return
    }

    if (Notification.permission === 'default') {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') return
    }

    const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!PUBLIC_VAPID_KEY) return

    function urlBase64ToUint8Array(base64String: string) {
      const padding = '='.repeat((4 - base64String.length % 4) % 4)
      const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
      const rawData = window.atob(base64)
      const outputArray = new Uint8Array(rawData.length)
      for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
      return outputArray
    }

    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      const existing = await reg.pushManager.getSubscription()
      if (existing) {
        const subData = existing.toJSON()
        const res = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subData.endpoint,
            p256dh: subData.keys?.p256dh,
            auth: subData.keys?.auth,
          }),
        })
        if (!res.ok) {
          const text = await res.text()
          throw new Error(`Server error: ${res.status} ${text}`)
        }
      } else {
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
        })
        const subData = sub.toJSON()
        const res = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subData.endpoint,
            p256dh: subData.keys?.p256dh,
            auth: subData.keys?.auth,
          }),
        })
        if (!res.ok) {
          const text = await res.text()
          throw new Error(`Server error: ${res.status} ${text}`)
        }
      }
      await loadData()
    } catch (e) {
      console.error('Push subscribe error:', e)
      alert('Ошибка при подписке: ' + (e instanceof Error ? e.message : String(e)))
    }
  }

  if (loading) return <CircularProgress sx={{ mt: 4 }} />

  const pushActive = pushSubs.length > 0

  return (
    <Box>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#000000' }}>
            Уведомления
          </Typography>

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Push-уведомления в браузере
          </Typography>

          {pushActive ? (
            <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2 }}>
              Уведомления включены — вы будете получать оповещения о новых постах
            </Alert>
          ) : (
            <Alert severity="info" icon={<NotificationsOffIcon />} sx={{ mb: 2 }}>
              Уведомления отключены
            </Alert>
          )}

          <Button
            variant={pushActive ? 'outlined' : 'contained'}
            color={pushActive ? 'error' : 'primary'}
            startIcon={pushActive ? <NotificationsOffIcon /> : <NotificationsActiveIcon />}
            onClick={pushActive ? unsubscribe : subscribe}
          >
            {pushActive ? 'Отписаться от уведомлений' : 'Подписаться на уведомления'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#000000' }}>
            Мои пекари
          </Typography>

          {subscriptions.length === 0 ? (
            <Alert severity="info">
              Вы ещё не подписаны ни на одного пекаря.
            </Alert>
          ) : (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                Вы подписаны на {subscriptions.length} пекаря
              </Alert>
              <List>
                {subscriptions.map((sub) => (
                  <ListItem key={sub.id}>
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={sub.baker.user.name || sub.baker.user.email}
                      secondary={`Подписан с ${new Date(sub.createdAt).toLocaleDateString('ru-RU')}`}
                    />
                    <Chip label="Подписан" color="success" size="small" />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
