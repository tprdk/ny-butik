import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImageUploader } from '@/components/admin/ImageUploader'
import type { UploadedImage } from '@/components/admin/ImageUploader'

const mockImages: UploadedImage[] = []

const defaultProps = {
  images: mockImages,
  productId: 1,
  onUpload: vi.fn(),
  onDelete: vi.fn(),
  onSetPrimary: vi.fn(),
  onReorder: vi.fn(),
}

describe('ImageUploader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('yükleme alanını gösterir', () => {
    render(<ImageUploader {...defaultProps} />)
    expect(screen.getByText(/Görsel yüklemek için tıklayın/)).toBeInTheDocument()
  })

  it('JPEG/PNG/WEBP formatlarını kabul ettiğini belirtir', () => {
    render(<ImageUploader {...defaultProps} />)
    expect(screen.getByText(/JPEG, PNG, WEBP/)).toBeInTheDocument()
  })

  it('desteklenmeyen format hata mesajı gösterir', async () => {
    render(<ImageUploader {...defaultProps} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    Object.defineProperty(input, 'files', { value: [file], configurable: true })
    fireEvent.change(input)

    await waitFor(() => {
      const errEl = document.querySelector('.text-red-500')
      expect(errEl?.textContent).toMatch(/JPEG|PNG|WEBP/)
    })
    expect(defaultProps.onUpload).not.toHaveBeenCalled()
  })

  it('5MB üzeri dosya hata mesajı gösterir', async () => {
    render(<ImageUploader {...defaultProps} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    // happy-dom'da büyük ArrayBuffer size olarak okunur
    const file = new File(['x'], 'large.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024, configurable: true })
    Object.defineProperty(input, 'files', { value: [file], configurable: true })
    fireEvent.change(input)

    await waitFor(() => {
      const errEl = document.querySelector('.text-red-500')
      expect(errEl?.textContent).toMatch(/5MB/)
    })
    expect(defaultProps.onUpload).not.toHaveBeenCalled()
  })

  it('geçerli JPEG dosyası onUpload callback çağırır', async () => {
    const user = userEvent.setup()
    const onUpload = vi.fn().mockResolvedValue({
      id: 1, url: 'http://test.com/img.jpg', isPrimary: true, displayOrder: 0,
    })
    render(<ImageUploader {...defaultProps} onUpload={onUpload} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['fake-image-data'], 'photo.jpg', { type: 'image/jpeg' })

    await user.upload(input, file)

    await waitFor(() => {
      expect(onUpload).toHaveBeenCalledWith(file)
    })
  })

  it('mevcut görselleri grid olarak gösterir', () => {
    const images: UploadedImage[] = [
      { id: 1, url: 'http://test.com/img1.jpg', isPrimary: true, displayOrder: 0 },
      { id: 2, url: 'http://test.com/img2.jpg', isPrimary: false, displayOrder: 1 },
    ]
    render(<ImageUploader {...defaultProps} images={images} />)

    const imgs = screen.getAllByRole('img')
    expect(imgs).toHaveLength(2)
  })

  it('primary görselde yıldız badge gösterir', () => {
    const images: UploadedImage[] = [
      { id: 1, url: 'http://test.com/img1.jpg', isPrimary: true, displayOrder: 0 },
    ]
    render(<ImageUploader {...defaultProps} images={images} />)

    // Star icon için title
    expect(screen.getByTitle('Kapak görseli')).toBeInTheDocument()
  })

  it('maxImages dolduysa upload alanı gizlenir', () => {
    const images: UploadedImage[] = Array.from({ length: 3 }, (_, i) => ({
      id: i + 1,
      url: `http://test.com/img${i + 1}.jpg`,
      isPrimary: i === 0,
      displayOrder: i,
    }))
    render(<ImageUploader {...defaultProps} images={images} maxImages={3} />)

    const input = document.querySelector('input[type="file"]')
    expect(input).not.toBeInTheDocument()
  })

  it('görsel sayısını gösterir', () => {
    const images: UploadedImage[] = [
      { id: 1, url: 'http://test.com/img1.jpg', isPrimary: true, displayOrder: 0 },
    ]
    render(<ImageUploader {...defaultProps} images={images} maxImages={10} />)

    expect(screen.getByText(/1\/10 görsel/)).toBeInTheDocument()
  })
})
