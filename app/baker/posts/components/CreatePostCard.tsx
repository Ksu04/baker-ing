import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Stack,
  Typography,
  IconButton,
  Paper,
  Collapse,
  Divider,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ShoppingCart as ShoppingCartIcon,
  Whatshot as LocalFireDepartmentIcon,
} from '@mui/icons-material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useListState } from '@/app/hooks/useFormState'
import ProductSelectionModal from './ProductSelectionModal'
import type { Product, SelectedPostProduct } from './types'
import dayjs from 'dayjs'

interface CreatePostCardProps {
  form: {
    values: { title: string; description: string; pickupDate: string }
    setValue: (key: string, value: string) => void
    reset: () => void
  }
  products: Product[]
  error: string | null
  onError: (error: string | null) => void
  onSuccess: () => void
}

export default function CreatePostCard({
  form,
  products,
  error,
  onError,
  onSuccess,
}: CreatePostCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [productModalOpen, setProductModalOpen] = React.useState(false)
  const [productSearch, setProductSearch] = React.useState('')

  const selectedProducts = useListState<SelectedPostProduct>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    onError(null)

    if (selectedProducts.items.length === 0) {
      onError('Выберите хотя бы один продукт')
      return
    }

    const postProducts = selectedProducts.items.map((p) => ({
      productId: p.productId,
      price: parseFloat(p.price),
      quantity: parseInt(p.quantity),
    }))

    const { title, description, pickupDate } = form.values

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        pickupDate,
        products: postProducts,
      }),
    })

    if (res.ok) {
      handleCancel()
      onSuccess()
    } else {
      try {
        onError((await res.json()).error)
      } catch {
        onError('Ошибка создания поста')
      }
    }
  }

  const updateSelectedProduct = (
    productId: string,
    field: 'price' | 'quantity',
    value: string
  ) => {
    selectedProducts.setItems(
      selectedProducts.items.map((p) =>
        p.productId === productId ? { ...p, [field]: value } : p
      )
    )
  }

  const handleCancel = () => {
    setIsExpanded(false)
    form.reset()
    selectedProducts.clear()
    setProductSearch('')
  }

  return (
    <Card sx={{ mb: 4, overflow: 'hidden' }}>
      <Box
        onClick={() => (isExpanded ? handleCancel() : setIsExpanded(true))}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          cursor: 'pointer',
          background: isExpanded
            ? (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
            : 'action.hover',
          color: isExpanded ? 'white' : 'text.primary',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: isExpanded
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
              bgcolor: isExpanded ? 'rgba(255,255,255,0.2)' : 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <ShoppingCartIcon />
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
              Создать пост
            </Box>
            <Box
              component="span"
              sx={{
                display: 'block',
                fontSize: '0.75rem',
                opacity: isExpanded ? 0.9 : 0.7,
              }}
            >
              {isExpanded
                ? 'Нажмите, чтобы свернуть'
                : 'Нажмите, чтобы развернуть и добавить пост'}
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
            bgcolor: isExpanded ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
            transition: 'transform 0.3s ease',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <ExpandMoreIcon sx={{ color: 'inherit' }} />
        </Box>
      </Box>

      <Collapse in={isExpanded}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {error && <Typography color="error">{error}</Typography>}

              <TextField
                fullWidth
                label="Заголовок"
                placeholder="например, Свежие шоколадные круассаны"
                value={form.values.title}
                onChange={(e) => form.setValue('title', e.target.value)}
                required
              />

              <TextField
                fullWidth
                label="Описание"
                placeholder="Опишите ваши продукты и их особенности..."
                value={form.values.description}
                onChange={(e) => form.setValue('description', e.target.value)}
                multiline
                rows={4}
              />

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Дата и время самовывоза"
                  value={
                    form.values.pickupDate
                      ? dayjs(form.values.pickupDate)
                      : null
                  }
                  onChange={(date) =>
                    form.setValue('pickupDate', date ? date.toISOString() : '')
                  }
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </LocalizationProvider>

              <Divider />

              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <LocalFireDepartmentIcon fontSize="small" /> Продукты в этом
                  посте
                </Typography>

                <Button
                  variant="outlined"
                  onClick={() => setProductModalOpen(true)}
                  startIcon={<AddIcon />}
                >
                  Выбрать продукты
                </Button>

                {selectedProducts.items.length > 0 && (
                  <Paper variant="outlined" sx={{ mt: 3, p: 3 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        letterSpacing: '0.5px',
                        color: 'text.secondary',
                      }}
                    >
                      Выбрано ({selectedProducts.items.length})
                    </Typography>
                    <Stack spacing={2}>
                      {selectedProducts.items.map((sp) => {
                        const product = products.find(
                          (p) => p.id === sp.productId
                        )
                        return (
                          <Card
                            key={sp.productId}
                            variant="outlined"
                            sx={{ p: 2 }}
                          >
                            <Stack
                              direction="row"
                              sx={{ alignItems: 'center' }}
                              spacing={2}
                            >
                              <Typography
                                variant="body2"
                                sx={{ flex: 1, fontWeight: 600 }}
                              >
                                {product?.name}
                              </Typography>
                              <TextField
                                label="Цена"
                                type="number"
                                size="small"
                                value={sp.price}
                                onChange={(e) =>
                                  updateSelectedProduct(
                                    sp.productId,
                                    'price',
                                    e.target.value
                                  )
                                }
                                onWheel={(e) =>
                                  e.target instanceof HTMLElement &&
                                  e.target.blur()
                                }
                                onKeyDown={(e) =>
                                  ['ArrowUp', 'ArrowDown'].includes(e.key) &&
                                  e.preventDefault()
                                }
                                required
                                sx={{ width: 120 }}
                                slotProps={{ input: { autoComplete: 'off' } }}
                              />
                              <TextField
                                label="Кол-во"
                                type="number"
                                size="small"
                                value={sp.quantity}
                                onChange={(e) =>
                                  updateSelectedProduct(
                                    sp.productId,
                                    'quantity',
                                    e.target.value
                                  )
                                }
                                onWheel={(e) =>
                                  e.target instanceof HTMLElement &&
                                  e.target.blur()
                                }
                                onKeyDown={(e) =>
                                  ['ArrowUp', 'ArrowDown'].includes(e.key) &&
                                  e.preventDefault()
                                }
                                required
                                sx={{ width: 90 }}
                                slotProps={{ input: { autoComplete: 'off' } }}
                              />
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() =>
                                  selectedProducts.remove(sp.productId)
                                }
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Card>
                        )
                      })}
                    </Stack>
                  </Paper>
                )}
              </Box>

              <ProductSelectionModal
                open={productModalOpen}
                products={products}
                selectedProducts={selectedProducts}
                productSearch={productSearch}
                onProductSearchChange={setProductSearch}
                onClose={() => setProductModalOpen(false)}
                onToggleProduct={(productId) => {
                  const existing = selectedProducts.items.find(
                    (p) => p.productId === productId
                  )
                  if (existing) {
                    selectedProducts.remove(productId)
                  } else {
                    selectedProducts.add({ productId, price: '', quantity: '' })
                  }
                }}
              />

              <Button type="submit" variant="contained" size="large">
                Создать пост
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Collapse>
    </Card>
  )
}
