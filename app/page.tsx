import { auth } from '@/auth'
import Link from 'next/link'
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import LoginIcon from '@mui/icons-material/Login'

export default async function Home() {
  const session = await auth()

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          variant="h2"
          sx={{ mb: 4, fontWeight: 700, color: 'primary.main' }}
        >
          🍰 Bakery Marketplace
        </Typography>

        {session?.user ? (
          <Card sx={{ maxWidth: 500, mx: 'auto' }}>
            <CardContent>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Welcome back!
                  </Typography>
                  <Typography
                    variant="body1"
                    color="textSecondary"
                    sx={{ mb: 2 }}
                  >
                    {session.user.email}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Role:</strong> {session.user.role}
                  </Typography>
                </Box>

                {session.user.role === 'BAKER' && (
                  <Box>
                    <Typography
                      variant="body1"
                      sx={{ mb: 2 }}
                      color="textSecondary"
                    >
                      Manage your bakery and create posts for customers.
                    </Typography>
                    <Link href="/baker" style={{ textDecoration: 'none' }}>
                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        startIcon={<DashboardIcon />}
                      >
                        Go to Baker Dashboard
                      </Button>
                    </Link>
                  </Box>
                )}

                {session.user.role === 'CUSTOMER' && (
                  <Box>
                    <Typography
                      variant="body1"
                      sx={{ mb: 2 }}
                      color="textSecondary"
                    >
                      Browse and book products from your favorite bakers.
                    </Typography>
                    <Link href="/customer" style={{ textDecoration: 'none' }}>
                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        startIcon={<DashboardIcon />}
                      >
                        Go to Customer Dashboard
                      </Button>
                    </Link>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Card sx={{ maxWidth: 500, mx: 'auto' }}>
            <CardContent>
              <Stack spacing={3} sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Welcome to Bakery Marketplace
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Sign in to browse bakery products or manage your bakery.
                </Typography>
                <Link href="/signin" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<LoginIcon />}
                  >
                    Sign In
                  </Button>
                </Link>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  )
}
