'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Box, Alert, CircularProgress, Container } from '@mui/material'
import { useFormState } from '../../hooks/useFormState'
import PostHeader from './components/PostHeader'
import CreatePostCard from './components/CreatePostCard'
import PostsList from './components/PostsList'
import DeleteConfirmDialog from './components/DeleteConfirmDialog'
import type { PostWithProducts } from './components/types'
import type { ProductBasic } from '@/app/types'

export default function PostsPage() {
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<PostWithProducts[]>([])
  const [products, setProducts] = useState<ProductBasic[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const form = useFormState({
    initialValues: { title: '', description: '', pickupDate: '' },
  })

  const loadData = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/posts').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/products').then((r) => (r.ok ? r.json() : [])),
    ]).then(([p, prods]) => {
      setPosts(p)
      setProducts(prods)
      setLoading(false)
    })
  }

  useEffect(() => {
    if (session?.user?.role === 'BAKER') {
      loadData()
    }
  }, [session])

  const handleDelete = async (id: string) => {
    await fetch(`/api/posts?id=${id}`, { method: 'DELETE' })
    setPosts(posts.filter((p) => p.id !== id))
    setDeleteId(null)
  }

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <Container
        maxWidth="md"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Container>
    )
  }

  if (session?.user?.role !== 'BAKER') {
    return (
      <Container maxWidth="md" sx={{ pt: 4 }}>
        <Alert severity="error">Нет доступа</Alert>
      </Container>
    )
  }

  const isExpired = (date: string) => new Date(date).getTime() + 86400000 < Date.now()

  return (
    <Box>
      <PostHeader />

      <CreatePostCard
        form={form}
        products={products}
        error={error}
        onError={setError}
        onSuccess={loadData}
      />

      <PostsList
        posts={posts}
        loading={loading}
        isExpired={isExpired}
        onDelete={setDeleteId}
      />

      <DeleteConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
      />
    </Box>
  )
}
