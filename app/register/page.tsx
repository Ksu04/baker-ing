'use client'
import { Container, Box, Card, CardContent, Typography } from '@mui/material'

export default function RegisterPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Registration Unavailable
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
              Registration requires a referral link. Please contact a baker for
              an invitation.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
