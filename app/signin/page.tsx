'use client'
import { useEffect, useState } from 'react'
import { signIn } from '@/auth'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { signInAction } from '../actions/auth'
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
} from '@mui/material'
import LoginIcon from '@mui/icons-material/Login'

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { data: session, status, update } = useSession()

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.role === 'BAKER') {
        router.push('/baker')
      } else if (session?.user?.role === 'CUSTOMER') {
        router.push('/customer')
      }
    }
  }, [session, status, router])

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LoginIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Sign In
            </Typography>
          </Box>

          <form
            onSubmit={async (e) => {
              e.preventDefault()
              setError(null)
              const fd = new FormData(e.currentTarget)
              const email = fd.get('email') as string
              const password = fd.get('password') as string

              const result = await signInAction({ email, password })

              if (result?.error) {
                setError('Invalid email or password')
              } else {
                await update()
              }
            }}
          >
            <Stack spacing={2}>
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
                label="Password"
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
                startIcon={<LoginIcon />}
              >
                Sign In
              </Button>
            </Stack>
          </form>

          <Box
            sx={{
              mt: 3,
              pt: 2,
              borderTop: '1px solid #eee',
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="textSecondary">
              New customer? Ask your baker for a referral link.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
