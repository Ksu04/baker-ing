import {
  Box,
  Card,
  Button,
  Stack,
  Typography,
  Modal,
  IconButton,
  Chip,
  TextField,
  Paper,
} from '@mui/material'
import {
  Close as CloseIcon,
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material'
import { Checkbox } from '@mui/material'
import type { Product, SelectedPostProduct } from './types'

interface ProductSelectionModalProps {
  open: boolean
  products: Product[]
  selectedProducts: {
    items: SelectedPostProduct[]
  }
  productSearch: string
  onProductSearchChange: (value: string) => void
  onClose: () => void
  onToggleProduct: (productId: string) => void
}

export default function ProductSelectionModal({
  open,
  products,
  selectedProducts,
  productSearch,
  onProductSearchChange,
  onClose,
  onToggleProduct,
}: ProductSelectionModalProps) {
  const filteredProducts = productSearch.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
      )
    : products

  const selectedProductIds = new Set(
    selectedProducts.items.map((p) => p.productId)
  )

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 900,
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" sx={{ mb: 2 }}>
            <Typography variant="h6">Выберите продукты</Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <TextField
            fullWidth
            size="small"
            placeholder="Поиск продуктов по названию..."
            value={productSearch}
            onChange={(e) => onProductSearchChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <SearchIcon sx={{ mr: 1.5, color: 'text.secondary' }} />
                ),
              },
            }}
          />
        </Box>

        <Box sx={{ p: 3, overflow: 'auto', flex: 1 }}>
          <Stack spacing={2}>
            {filteredProducts.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  Ничего не найдено. Попробуйте другой запрос.
                </Typography>
              </Paper>
            ) : (
              filteredProducts.map((p) => (
                <Card
                  key={p.id}
                  variant="outlined"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => onToggleProduct(p.id)}
                >
                  <Box sx={{ display: 'flex', gap: 3, p: 2.5 }}>
                    {p.photo ? (
                      <Box
                        component="img"
                        src={p.photo}
                        alt={p.name}
                        sx={{
                          width: 100,
                          height: 100,
                          objectFit: 'cover',
                          borderRadius: 1,
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: 1,
                          bgcolor: 'action.hover',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <ShoppingCartIcon sx={{ color: 'text.secondary' }} />
                      </Box>
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={2}>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700 }}
                          >
                            {p.name}
                          </Typography>
                          {p.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 0.5 }}
                            >
                              {p.description}
                            </Typography>
                          )}
                        </Box>
                        <Checkbox
                          checked={selectedProductIds.has(p.id)}
                          onChange={() => onToggleProduct(p.id)}
                        />
                      </Stack>
                      {p.kcal && (
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 1,
                            fontWeight: 600,
                            color: 'text.secondary',
                          }}
                        >
                          {p.kcal} kcal{p.protein && ` | P: ${p.protein}g`}
                          {p.fat && ` | F: ${p.fat}g`}
                          {p.carbs && ` | C: ${p.carbs}g`}
                        </Typography>
                      )}
                      {p.ingredients.length > 0 && (
                        <Box sx={{ mt: 1.5 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              fontWeight: 700,
                              color: 'text.secondary',
                              mb: 0.5,
                              textTransform: 'uppercase',
                              fontSize: '0.7rem',
                            }}
                          >
                            Ингредиенты:
                          </Typography>
                          <Stack direction="row" spacing={0.5}>
                            {p.ingredients.slice(0, 5).map((ing) => (
                              <Chip
                                key={ing.id}
                                label={`${ing.ingredient.name}${ing.weight ? ` (${ing.weight}${ing.metric || 'g'})` : ''}`}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                            {p.ingredients.length > 5 && (
                              <Chip
                                label={`+${p.ingredients.length - 5} ещё`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Card>
              ))
            )}
          </Stack>
        </Box>

        <Box
          sx={{
            p: 3,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Chip
            label={`Выбрано: ${selectedProducts.items.length}`}
            color={selectedProducts.items.length > 0 ? 'primary' : 'default'}
            icon={<ShoppingCartIcon />}
          />
          <Button variant="contained" onClick={onClose}>
            Готово
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}
