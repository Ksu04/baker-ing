'use client'
import { Box, Card, CardContent, Collapse } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import { ReactNode } from 'react'

interface ProductFormToggleProps {
  showForm: boolean
  isEditing: boolean
  onToggle: () => void
  children: ReactNode
}

export default function ProductFormToggle({
  showForm,
  isEditing,
  onToggle,
  children,
}: ProductFormToggleProps) {
  return (
    <Card sx={{ mb: 4, overflow: 'hidden' }}>
      <Box
        onClick={onToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          cursor: 'pointer',
          background: showForm
            ? (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
            : 'action.hover',
          color: showForm ? 'white' : 'text.primary',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: showForm
              ? (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
              : 'action.selected',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: showForm ? 'rgba(255,255,255,0.2)' : 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            {showForm ? <EditIcon /> : <AddIcon />}
          </Box>
          <Box>
            <Box
              component="span"
              sx={{
                display: 'block',
                fontWeight: 600,
                mb: 0,
                lineHeight: 1.2,
                fontSize: '1.125rem',
              }}
            >
              {isEditing ? 'Editing Product' : 'Create New Product'}
            </Box>
            <Box
              component="span"
              sx={{
                display: 'block',
                fontSize: '0.75rem',
                opacity: showForm ? 0.9 : 0.7,
              }}
            >
              {showForm
                ? 'Click to collapse'
                : 'Click to expand and add a new product'}
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: showForm ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
            transition: 'transform 0.3s ease',
            transform: showForm ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <ExpandMoreIcon sx={{ color: 'inherit' }} />
        </Box>
      </Box>

      <Collapse in={showForm}>
        <CardContent>{children}</CardContent>
      </Collapse>
    </Card>
  )
}
