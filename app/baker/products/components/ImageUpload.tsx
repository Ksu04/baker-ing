'use client'
import { Box, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

interface ImageUploadProps {
  photo: string
  onPhotoChange: (photo: string) => void
  onFileChange: (file: File | null) => void
}

export default function ImageUpload({
  photo,
  onPhotoChange,
  onFileChange,
}: ImageUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0] || null
    onFileChange(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string | null
        if (result) onPhotoChange(result)
      }
      reader.readAsDataURL(file)
    } else {
      onPhotoChange('')
    }
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxHeight: 280,
        borderRadius: 2,
        border: '2px dashed',
        borderColor: 'divider',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'pointer',
        '&:hover .upload-overlay': { opacity: 1 },
      }}
    >
      {photo ? (
        <Box
          component="img"
          src={photo}
          alt="Preview"
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <Box sx={{ textAlign: 'center', color: 'text.secondary', p: 2 }}>
          <AddIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
          <Typography variant="body2">Click to upload</Typography>
        </Box>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0,
          cursor: 'pointer',
          width: '100%',
          height: '100%',
        }}
      />
    </Box>
  )
}
