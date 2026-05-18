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
}

export default function IngredientsPage() {
  const { data: session, status } = useSession()
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [name, setName] = useState('')
  const [metric, setMetric] = useState('g')
  const [quantity, setQuantity] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

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
    return <Alert severity="error">Unauthorized</Alert>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const method = editing ? 'PUT' : 'POST'
    const body = editing
      ? { id: editing, name, quantity: parseFloat(quantity), metric }
      : { name, quantity: parseFloat(quantity), metric }

    const res = await fetch('/api/ingredients', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      setName('')
      setQuantity('')
      setEditing(null)
      const updated = await fetch('/api/ingredients').then((r) => r.json())
      setIngredients(updated)
    } else {
      setError((await res.json()).error)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleteId(null)
    await fetch(`/api/ingredients?id=${id}`, { method: 'DELETE' })
    setIngredients(ingredients.filter((i) => i.id !== id))
  }

  const handleEdit = (ing: Ingredient) => {
    setEditing(ing.id)
    setName(ing.name)
    setQuantity(String(ing.quantity))
    setMetric(ing.metric)
  }

  return (
    <Box>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
            🥄 Manage Ingredients
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Ingredient Name"
                  placeholder="e.g., Flour"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  size="small"
                  sx={{ minWidth: 150, flex: 1 }}
                />
                <TextField
                  label="Quantity"
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
                  label="Metric"
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                  size="small"
                  sx={{ width: 120 }}
                >
                  <MenuItem value="g">g</MenuItem>
                  <MenuItem value="kg">kg</MenuItem>
                  <MenuItem value="ml">ml</MenuItem>
                  <MenuItem value="l">l</MenuItem>
                  <MenuItem value="pcs">pcs</MenuItem>
                  <MenuItem value="tbsp">tbsp</MenuItem>
                  <MenuItem value="tsp">tsp</MenuItem>
                </TextField>
              </Box>
              {error && <Alert severity="error">{error}</Alert>}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<AddIcon />}
                >
                  {editing ? 'Update' : 'Add'}
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
                    }}
                  >
                    Cancel
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
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Quantity
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Actions
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
                    {ing.quantity} {ing.metric}
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
              No ingredients yet. Add one to get started!
            </Typography>
          </CardContent>
        </Card>
      )}

      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Ingredient?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this ingredient? This action cannot
            be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button
            onClick={() => deleteId && handleDelete(deleteId)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
