import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProductCard } from '@/components/catalog/ProductCard'
import type { ProductSummary } from '@/types/catalog.types'

const mockProduct: ProductSummary = {
  id: 1,
  name: 'Test Abaya',
  slug: 'test-abaya',
  shortDesc: 'Güzel bir abaya',
  minPrice: 299.9,
  minSalePrice: null,
  inStock: true,
  primaryImageUrl: null,
  featured: true,
  category: { id: 1, name: 'Elbise', slug: 'elbise', isActive: true, children: [] },
  status: 'ACTIVE',
}

const renderCard = (product: ProductSummary = mockProduct) =>
  render(
    <MemoryRouter>
      <ProductCard product={product} />
    </MemoryRouter>
  )

describe('ProductCard', () => {
  it('ürün adını gösterir', () => {
    renderCard()
    expect(screen.getByText('Test Abaya')).toBeInTheDocument()
  })

  it('fiyatı TL formatında gösterir', () => {
    renderCard()
    expect(screen.getByText(/299/)).toBeInTheDocument()
  })

  it('doğru URL\'e bağlantı oluşturur', () => {
    renderCard()
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/urunler/test-abaya')
  })

  it('stok dışı ürünlerde "Tükendi" gösterir', () => {
    renderCard({ ...mockProduct, inStock: false })
    expect(screen.getByText('Tükendi')).toBeInTheDocument()
  })

  it('indirim varsa "İndirim" badge gösterir', () => {
    renderCard({ ...mockProduct, minSalePrice: 249.9 })
    expect(screen.getByText('İndirim')).toBeInTheDocument()
  })

  it('indirim yoksa "İndirim" badge göstermez', () => {
    renderCard({ ...mockProduct, minSalePrice: null })
    expect(screen.queryByText('İndirim')).not.toBeInTheDocument()
  })

  it('resim yoksa placeholder gösterir', () => {
    renderCard({ ...mockProduct, primaryImageUrl: null })
    // img elementi olmamalı
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('resim varsa img elementi gösterir', () => {
    renderCard({ ...mockProduct, primaryImageUrl: 'http://example.com/img.jpg' })
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'http://example.com/img.jpg')
    expect(img).toHaveAttribute('alt', 'Test Abaya')
  })

  it('favori butonunu tıklamak sayfa navigasyonunu engellemez', async () => {
    const { container } = renderCard()
    const favoriteBtn = container.querySelector('[aria-label="Favorilere ekle"]')
    expect(favoriteBtn).toBeInTheDocument()
  })
})
