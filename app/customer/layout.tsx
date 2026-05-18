'use client'
import Link from 'next/link'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import LogoutIcon from '@mui/icons-material/Logout'
import { signOut } from 'next-auth/react'

const drawerWidth = 240

const menuItems = [
  { label: "My Baker's Posts", href: '/customer', icon: ShoppingBagIcon },
  { label: 'My Bookings', href: '/customer/bookings', icon: LocalShippingIcon },
]

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            marginTop: 0,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box
            sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#000000' }}
          >
            🛍️ Customer
          </Box>
        </Box>
        <List sx={{ flex: 1 }}>
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <ListItem key={item.href} disablePadding>
                <Link
                  href={item.href}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    width: '100%',
                  }}
                >
                  <ListItemButton>
                    <ListItemIcon>
                      <Icon />
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </Link>
              </ListItem>
            )
          })}
        </List>
        <Box sx={{ p: 2, borderTop: '1px solid #E0E0E0' }}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={() => signOut()}
          >
            Sign Out
          </Button>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
