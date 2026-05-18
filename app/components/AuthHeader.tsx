'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  CircularProgress,
  Box,
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import LoginIcon from '@mui/icons-material/Login'

export default function AuthHeader() {
  const { data: session, status } = useSession()

  return (
    <AppBar position="static">
      <Toolbar>
        <Link
          href="/"
          style={{
            textDecoration: 'none',
            color: 'inherit',
            marginRight: 'auto',
          }}
        >
          <Typography variant="h6" sx={{ cursor: 'pointer', fontWeight: 700 }}>
            Baker-Ing
          </Typography>
        </Link>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {status === 'loading' ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : session?.user?.email ? (
            <>
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255, 255, 255, 0.9)' }}
              >
                {session.user.email}
              </Typography>
              <Button
                color="inherit"
                variant="outlined"
                size="small"
                startIcon={<LogoutIcon />}
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Выйти
              </Button>
            </>
          ) : (
            <Link href="/signin" style={{ textDecoration: 'none' }}>
              <Button color="inherit" variant="text" startIcon={<LoginIcon />}>
                Войти
              </Button>
            </Link>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
