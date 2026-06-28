import { useCallback, useState } from 'react'
import { Upload, X, Star, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface UploadedImage {
  id: number
  url: string
  isPrimary: boolean
  displayOrder: number
  altText?: string
}

interface Props {
  images: UploadedImage[]
  productId: number
  onUpload: (file: File) => Promise<UploadedImage>
  onDelete: (imageId: number) => Promise<void>
  onSetPrimary: (imageId: number) => Promise<void>
  onReorder: (imageIds: number[]) => Promise<void>
  maxImages?: number
}

export function ImageUploader({
  images,
  onUpload,
  onDelete,
  onSetPrimary,
  maxImages = 10,
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return
      if (images.length >= maxImages) {
        setError(`Maksimum ${maxImages} görsel yüklenebilir`)
        return
      }

      const allowed = ['image/jpeg', 'image/png', 'image/webp']
      const file = files[0]

      if (!allowed.includes(file.type)) {
        setError('Sadece JPEG, PNG ve WEBP formatları desteklenir')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Dosya boyutu 5MB\'ı aşamaz')
        return
      }

      setError(null)
      setUploading(true)
      try {
        await onUpload(file)
      } catch {
        setError('Görsel yüklenemedi. Lütfen tekrar deneyin.')
      } finally {
        setUploading(false)
      }
    },
    [images.length, maxImages, onUpload]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleDelete = async (imageId: number) => {
    setDeletingId(imageId)
    try {
      await onDelete(imageId)
    } finally {
      setDeletingId(null)
    }
  }

  const sorted = [...images].sort((a, b) => a.displayOrder - b.displayOrder)

  return (
    <div className="flex flex-col gap-4">
      {/* Upload zone */}
      {images.length < maxImages && (
        <label
          className={cn(
            'relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors',
            dragOver
              ? 'border-neutral-600 bg-neutral-50'
              : 'border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50'
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={uploading}
          />
          {uploading ? (
            <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-neutral-400" />
          )}
          <div className="text-center">
            <p className="text-sm font-medium text-neutral-700">
              {uploading ? 'Yükleniyor...' : 'Görsel yüklemek için tıklayın veya sürükleyin'}
            </p>
            <p className="text-xs text-neutral-400 mt-1">JPEG, PNG, WEBP · Max 5MB</p>
          </div>
        </label>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Image grid */}
      {sorted.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {sorted.map((img) => (
            <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
              <img
                src={img.url}
                alt={img.altText ?? 'Ürün görseli'}
                className="w-full h-full object-cover"
              />

              {/* Primary badge */}
              {img.isPrimary && (
                <span className="absolute top-1 left-1 bg-amber-400 text-white rounded-full p-1" title="Kapak görseli">
                  <Star className="w-3 h-3 fill-white" />
                </span>
              )}

              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => onSetPrimary(img.id)}
                    title="Kapak yap"
                    className="p-1.5 bg-white rounded-full hover:bg-amber-50 transition-colors"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  disabled={deletingId === img.id}
                  title="Sil"
                  className="p-1.5 bg-white rounded-full hover:bg-red-50 transition-colors"
                >
                  {deletingId === img.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-red-500" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-neutral-400">{images.length}/{maxImages} görsel · Yıldızlı olan kapak görseli</p>
      )}
    </div>
  )
}
