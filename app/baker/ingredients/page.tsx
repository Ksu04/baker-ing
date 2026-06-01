'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import MenuItem from '@mui/material/MenuItem'

interface Ingredient {
  id: string
  name: string
  quantity: number
  metric: string
  kcal?: number | null
  protein?: number | null
  fat?: number | null
  carbs?: number | null
}

export default function IngredientsPage() {
  const { data: session, status } = useSession()
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [name, setName] = useState('')
  const [metric, setMetric] = useState('г')
  const [quantity, setQuantity] = useState('')
  const [kcal, setKcal] = useState('')
  const [protein, setProtein] = useState('')
  const [fat, setFat] = useState('')
  const [carbs, setCarbs] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [addStock, setAddStock] = useState<Record<string, string>>({})

  useEffect(() => {
    if (session?.user?.role === 'BAKER') {
      fetch('/api/ingredients')
        .then((r) => (r.ok ? r.json() : []))
        .then(setIngredients)
    }
  }, [session])

  if (status === 'loading' || status === 'unauthenticated')
    return <CircularProgress sx={{ mt: 4 }} />
  if (session?.user?.role !== 'BAKER') {
    return <Alert severity="error">Нет доступа</Alert>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const method = editing ? 'PUT' : 'POST'
    const body = editing
      ? { id: editing, name, quantity: parseFloat(quantity), metric, kcal, protein, fat, carbs }
      : { name, quantity: parseFloat(quantity), metric, kcal, protein, fat, carbs }

    const res = await fetch('/api/ingredients', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      setName('')
      setQuantity('')
      setKcal('')
      setProtein('')
      setFat('')
      setCarbs('')
      setEditing(null)
      const updated = await fetch('/api/ingredients').then((r) => r.json())
      setIngredients(updated)
    } else {
      try {
        setError((await res.json()).error)
      } catch {
        setError('Ошибка сохранения ингредиента')
      }
    }
  }

  const handleDelete = async (id: string) => {
    setDeleteId(null)
    const res = await fetch(`/api/ingredients?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setIngredients(ingredients.filter((i) => i.id !== id))
    } else {
      const msg = await res.json().then((d) => d.error).catch(() => '')
      setError(msg || 'Не удалось удалить ингредиент. Возможно, он используется в продуктах.')
    }
  }

  const handleAddStock = async (id: string) => {
    const val = addStock[id]
    if (!val || parseFloat(val) <= 0) return
    const res = await fetch('/api/ingredients', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, addQuantity: parseFloat(val) }),
    })
    if (res.ok) {
      setAddStock((prev) => ({ ...prev, [id]: '' }))
      const updated = await fetch('/api/ingredients').then((r) => r.json())
      setIngredients(updated)
    }
  }

  const handleEdit = (ing: Ingredient) => {
    setEditing(ing.id)
    setName(ing.name)
    setQuantity(String(ing.quantity))
    setMetric(ing.metric)
    setKcal(ing.kcal != null ? String(ing.kcal) : '')
    setProtein(ing.protein != null ? String(ing.protein) : '')
    setFat(ing.fat != null ? String(ing.fat) : '')
    setCarbs(ing.carbs != null ? String(ing.carbs) : '')
  }

  return (
    <Box>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
            Управление ингредиентами
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Название"
                  placeholder="например, Мука"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  size="small"
                  sx={{ minWidth: 150, flex: 1 }}
                />
                <TextField
                  label="Количество"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  size="small"
                  sx={{ width: 100 }}
                  slotProps={{ input: { autoComplete: 'off' } }}
                />
                <TextField
                  select
                  label="Ед. изм."
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                  size="small"
                  sx={{ width: 120 }}
                >
                  <MenuItem value="г">г</MenuItem>
                  <MenuItem value="кг">кг</MenuItem>
                  <MenuItem value="мл">мл</MenuItem>
                  <MenuItem value="л">л</MenuItem>
                  <MenuItem value="шт">шт</MenuItem>
                  <MenuItem value="ст.л.">ст.л.</MenuItem>
                  <MenuItem value="ч.л.">ч.л.</MenuItem>
                </TextField>
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#000000', display: 'block', mb: 0.5 }}>
                КБЖУ (на 100г) — опционально, для расчёта КБЖУ продуктов
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField label="Ккал" type="number" value={kcal} onChange={(e) => setKcal(e.target.value)} size="small" sx={{ width: 100 }} slotProps={{ input: { autoComplete: 'off' } }} />
                <TextField label="Белки, г" type="number" value={protein} onChange={(e) => setProtein(e.target.value)} size="small" sx={{ width: 100 }} slotProps={{ input: { autoComplete: 'off' } }} />
                <TextField label="Жиры, г" type="number" value={fat} onChange={(e) => setFat(e.target.value)} size="small" sx={{ width: 100 }} slotProps={{ input: { autoComplete: 'off' } }} />
                <TextField label="Углеводы, г" type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} size="small" sx={{ width: 110 }} slotProps={{ input: { autoComplete: 'off' } }} />
              </Box>
              {error && <Alert severity="error">{error}</Alert>}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<AddIcon />}
                >
                  {editing ? 'Обновить' : 'Добавить'}
                </Button>
                {editing && (
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => {
                      setEditing(null)
                      setName('')
                      setQuantity('')
                      setMetric('g')
                      setKcal('')
                      setProtein('')
                      setFat('')
                      setCarbs('')
                    }}
                  >
                    Отмена
                  </Button>
                )}
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>

      {ingredients.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#FFECB7' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Название</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Количество
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Добавить
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Действия
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ingredients.map((ing) => (
                <TableRow key={ing.id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>{ing.name}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    {ing.quantity} {ing.metric || 'г'}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                      <TextField
                        type="number"
                        size="small"
                        placeholder="0"
                        value={addStock[ing.id] || ''}
                        onChange={(e) =>
                          setAddStock((prev) => ({ ...prev, [ing.id]: e.target.value }))
                        }
                        onWheel={(e) =>
                          e.target instanceof HTMLElement && e.target.blur()
                        }
                        onKeyDown={(e) =>
                          ['ArrowUp', 'ArrowDown'].includes(e.key) && e.preventDefault()
                        }
                        slotProps={{ htmlInput: { style: { textAlign: 'right' } }, input: { autoComplete: 'off' } }}
                        sx={{ width: 90 }}
                      />
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleAddStock(ing.id)}
                        disabled={!addStock[ing.id] || parseFloat(addStock[ing.id]) <= 0}
                        sx={{ minWidth: 32, px: 1 }}
                      >
                        +
                      </Button>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(ing)}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteId(ing.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="textSecondary">
              Ингредиентов пока нет. Добавьте первый, чтобы начать!
            </Typography>
          </CardContent>
        </Card>
      )}

      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle>Удалить ингредиент?</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить этот ингредиент? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Отмена</Button>
          <Button
            onClick={() => deleteId && handleDelete(deleteId)}
            color="error"
            variant="contained"
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
