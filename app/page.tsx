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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 4 }}>
          <Box component="img" src="/logo.svg" alt="Baker-Ing" sx={{ height: 144, width: 'auto' }} />
          <Typography variant="h2" sx={{ fontWeight: 700, color: '#000000', fontFamily: 'MV Boli' }}>
            Baker-Ing
          </Typography>
        </Box>

        {session?.user ? (
          <Card sx={{ maxWidth: 500, mx: 'auto' }}>
            <CardContent>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    С возвращением!
                  </Typography>
                  <Typography
                    variant="body1"
                    color="textSecondary"
                    sx={{ mb: 2 }}
                  >
                    {session.user.email}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Роль:</strong> {session.user.role === 'BAKER' ? 'Пекарь' : 'Покупатель'}
                  </Typography>
                </Box>

                {session.user.role === 'BAKER' && (
                  <Box>
                    <Typography
                      variant="body1"
                      sx={{ mb: 2 }}
                      color="textSecondary"
                    >
                      Управляйте своей пекарней и создавайте посты для покупателей.
                    </Typography>
                    <Link href="/baker" style={{ textDecoration: 'none' }}>
                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        startIcon={<DashboardIcon />}
                      >
                        Перейти в панель пекаря
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
                      Просматривайте и заказывайте товары от любимых пекарей.
                    </Typography>
                    <Link href="/customer" style={{ textDecoration: 'none' }}>
                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        startIcon={<DashboardIcon />}
                      >
                        Перейти в панель покупателя
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
                  Добро пожаловать в Baker-Ing
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Войдите, чтобы просматривать товары пекарен или управлять своей пекарней.
                </Typography>
                <Link href="/signin" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<LoginIcon />}
                  >
                    Войти
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
