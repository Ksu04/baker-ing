'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Button,
  Divider,
  ListItem,
} from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  message: string
  read: boolean
  createdAt: string
  data: { postId?: string } | null
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) {
        setNotifications([])
        setUnreadCount(0)
        return
      }
      const data = await res.json()
      setNotifications(data)
      setUnreadCount(data.filter((n: Notification) => !n.read).length)
    } catch (error) {
      console.error('Failed to fetch notifications', error)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markRead: true, notificationId: notification.id }),
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
  }

  const markAllAsRead = async () => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    })
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const open = Boolean(anchorEl)

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ width: 320, maxHeight: 400, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">Notifications</Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
          </Box>
          <Divider />
          {notifications.length === 0 ? (
            <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              No notifications
            </Typography>
          ) : (
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {notifications.slice(0, 10).map((notification) => {
                const postId = notification.data?.postId
                const content = (
                  <ListItemButton
                    sx={{
                      bgcolor: notification.read ? 'transparent' : 'action.hover',
                      '&:hover': { bgcolor: 'action.selected' },
                    }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <ListItemText
                      primary={notification.message}
                      secondary={new Date(notification.createdAt).toLocaleString()}
                      sx={{
                        fontWeight: notification.read ? 'normal' : 'bold',
                      }}
                    />
                  </ListItemButton>
                )
                return (
                  <ListItem key={notification.id} disablePadding>
                    {postId ? (
                      <Link
                        href={`/baker/posts/${postId}`}
                        style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}
                      >
                        {content}
                      </Link>
                    ) : (
                      content
                    )}
                  </ListItem>
                )
              })}
            </List>
          )}
        </Box>
      </Popover>
    </>
  )
}