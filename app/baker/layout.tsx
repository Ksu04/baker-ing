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
  Typography,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import LocalFloristIcon from '@mui/icons-material/LocalFlorist'
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits'
import ArticleIcon from '@mui/icons-material/Article'
import SendIcon from '@mui/icons-material/Send'
import LogoutIcon from '@mui/icons-material/Logout'
import { signOut } from 'next-auth/react'
import NotificationBell from '@/app/components/NotificationBell'

const drawerWidth = 240

const menuItems = [
  { label: 'Dashboard', href: '/baker', icon: DashboardIcon },
  { label: 'Ingredients', href: '/baker/ingredients', icon: LocalFloristIcon },
  {
    label: 'Products',
    href: '/baker/products',
    icon: ProductionQuantityLimitsIcon,
  },
  { label: 'Posts', href: '/baker/posts', icon: ArticleIcon },
  { label: 'Referral Links', href: '/baker/invites', icon: SendIcon },
]

export default function BakerLayout({
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
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box
            sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#000000' }}
          >
            🍰 Bakery
          </Box>
          <NotificationBell />
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
