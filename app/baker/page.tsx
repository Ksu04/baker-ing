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
        Unauthorized. <a href="/signin">Sign in</a>
      </Alert>
    )
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
            🍰 Baker Dashboard
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Welcome, {session.user.email}
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Generate Referral Link
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Create referral links for customers to register and automatically
            subscribe to your posts.
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
                  setError((await res.json()).error)
                }
              } catch (err) {
                setError('Failed to generate invite')
              } finally {
                setLoading(false)
              }
            }}
            disabled={loading}
          >
            Generate Invite Link
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
                Share this link with customers:
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
                  Copy
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
