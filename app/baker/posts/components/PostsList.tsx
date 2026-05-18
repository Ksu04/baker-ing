import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  CircularProgress,
} from '@mui/material'
import type { PostWithProducts } from './types'
import PostCard from './PostCard'

interface PostsListProps {
  posts: PostWithProducts[]
  loading: boolean
  isExpired: (date: string) => boolean
  onDelete: (id: string) => void
}

export default function PostsList({
  posts,
  loading,
  isExpired,
  onDelete,
}: PostsListProps) {
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 8,
        }}
      >
        <CircularProgress size={50} />
      </Box>
    )
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Typography
            variant="h6"
            sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}
          >
            No Posts Yet
          </Typography>
          <Typography color="textSecondary">
            Create your first post above to start selling!
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Stack spacing={3}>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          isExpired={isExpired}
          onDelete={onDelete}
        />
      ))}
    </Stack>
  )
}
