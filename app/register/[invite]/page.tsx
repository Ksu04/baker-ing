'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import PersonAddIcon from '@mui/icons-material/PersonAdd'

export default function RegisterInvitePage({
  params,
}: {
  params: Promise<{ invite: string }>
}) {
  const { invite } = React.use(params)

  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <PersonAddIcon
              sx={{ fontSize: 40, color: 'primary.main', mb: 2 }}
            />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Customer Registration
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Complete your registration to get started
            </Typography>
          </Box>

          <form
            onSubmit={async (e) => {
              e.preventDefault()
              setError(null)
              const fd = new FormData(e.currentTarget)
              const body = Object.fromEntries(fd.entries())

              const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...body, invite: invite }),
              })

              if (res.ok) {
                router.push('/signin')
              } else {
                setError((await res.json()).error)
              }
            }}
          >
            <input type="hidden" name="invite" value={invite} />
            <Stack spacing={2}>
              <TextField
                fullWidth
                name="name"
                label="Full Name"
                type="text"
                required
                variant="outlined"
              />
              <TextField
                fullWidth
                name="phone"
                label="Phone"
                type="tel"
                required
                variant="outlined"
              />
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
                startIcon={<PersonAddIcon />}
              >
                Register
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Container>
  )
}
