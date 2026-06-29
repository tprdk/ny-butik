import { Helmet } from 'react-helmet-async'
import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingBag, Heart, Share2, ChevronRight } from 'lucide-react'
import { useProduct } from '@/hooks/useProducts'
import { ImageGallery } from '@/components/catalog/ImageGallery'
import { ColorSwatch } from '@/components/catalog/ColorSwatch'
import { SizeSelector } from '@/components/catalog/SizeSelector'
import { formatPrice } from '@/lib/format'
import { useCart } from '@/hooks/useCart'
import { useCartStore } from '@/store/cart.store'
import type { Color, Size } from '@/types/catalog.types'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: product, isLoading, isError } = useProduct(slug ?? '')
  const [selectedColorId, setSelectedColorId] = useState<number | undefined>()
  const [selectedSizeId, setSelectedSizeId] = useState<number | undefined>()
  const { addItem } = useCart()
  const openCart = useCartStore((s) => s.open)

  const colors = useMemo(() => {
    if (!product) return []
    const seen = new Set<number>()
    return product.variants.filter((v) => v.color && v.isActive).reduce<Color[]>((acc, v) => {
      if (v.color && !seen.has(v.color.id)) { seen.add(v.color.id); acc.push(v.color) }
      return acc
    }, [])
  }, [product])

  const sizes = useMemo(() => {
    if (!product) return []
    const seen = new Set<number>()
    return product.variants
      .filter((v) => v.size && v.isActive && (!selectedColorId || v.color?.id === selectedColorId))
      .reduce<Size[]>((acc, v) => {
        if (v.size && !seen.has(v.size.id)) { seen.add(v.size.id); acc.push(v.size) }
        return acc
      }, [])
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }, [product, selectedColorId])

  const outOfStockSizeIds = useMemo(() =>
    !product ? [] : product.variants
      .filter((v) => v.size && !v.inStock && (!selectedColorId || v.color?.id === selectedColorId))
      .map((v) => v.size!.id),
  [product, selectedColorId])

  const selectedVariant = useMemo(() =>
    !product || !selectedSizeId ? undefined : product.variants.find(
      (v) => v.isActive && v.size?.id === selectedSizeId && (!selectedColorId || v.color?.id === selectedColorId)
    ),
  [product, selectedColorId, selectedSizeId])

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Helmet><title>Yükleniyor... — NY Butik</title></Helmet>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="aspect-[3/4] bg-neutral-200 rounded-2xl animate-pulse" />
        <div className="flex flex-col gap-4 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-6 bg-neutral-200 rounded" />)}
        </div>
      </div>
    </div>
  )

  if (isError || !product) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <Helmet><title>Ürün Bulunamadı — NY Butik</title></Helmet>
      <p className="text-neutral-500">Ürün bulunamadı.</p>
      <Link to="/urunler" className="text-sm text-neutral-700 underline mt-2 inline-block">Ürünlere dön</Link>
    </div>
  )

  const displayPrice = selectedVariant?.effectivePrice ?? product.variants[0]?.effectivePrice
  const displayOriginal = selectedVariant?.salePrice != null ? selectedVariant.price
    : product.variants[0]?.salePrice != null ? product.variants[0].price : undefined

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>{product.name} — NY Butik</title>
        <meta name="description" content={product.shortDesc ?? `${product.name} — NY Butik'te en iyi fiyatlarla tesettür giyim.`} />
        <meta property="og:title" content={`${product.name} — NY Butik`} />
        <meta property="og:description" content={product.shortDesc ?? `${product.name} — NY Butik'te en iyi fiyatlarla.`} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`https://www.nybutik.com/urunler/${product.slug}`} />
        {product.images[0] && <meta property="og:image" content={product.images[0].url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product.name} />
        {product.images[0] && <meta name="twitter:image" content={product.images[0].url} />}
      </Helmet>
      <nav className="flex items-center gap-1 text-xs text-neutral-500 mb-6">
        <Link to="/" className="hover:text-neutral-700">Ana Sayfa</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/urunler" className="hover:text-neutral-700">Ürünler</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neutral-700 truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <ImageGallery images={product.images} productName={product.name} />

        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm text-neutral-500 mb-1">{product.category.name}</p>
            <h1 className="text-2xl font-bold text-neutral-900">{product.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-neutral-900">
              {displayPrice != null ? formatPrice(displayPrice) : '—'}
            </span>
            {displayOriginal && <span className="text-lg text-neutral-400 line-through">{formatPrice(displayOriginal)}</span>}
          </div>

          {product.shortDesc && <p className="text-sm text-neutral-600 leading-relaxed">{product.shortDesc}</p>}

          {colors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-2">
                Renk{selectedColorId && ': ' + colors.find((c) => c.id === selectedColorId)?.name}
              </p>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => (
                  <ColorSwatch key={color.id} color={color} selected={selectedColorId === color.id}
                    onClick={() => { setSelectedColorId(color.id === selectedColorId ? undefined : color.id); setSelectedSizeId(undefined) }} />
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-2">Beden</p>
              <SizeSelector sizes={sizes} selectedId={selectedSizeId} disabledIds={outOfStockSizeIds}
                onSelect={(s) => setSelectedSizeId(s.id === selectedSizeId ? undefined : s.id)} />
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <button
              disabled={!selectedVariant || !selectedVariant.inStock || addItem.isPending}
              onClick={() => {
                if (!selectedVariant) return
                addItem.mutate({ variantId: selectedVariant.id, quantity: 1 }, {
                  onSuccess: openCart,
                })
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-neutral-900 text-white py-3.5 px-6 rounded-xl font-medium hover:bg-neutral-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <ShoppingBag className="w-5 h-5" />
              {addItem.isPending ? 'Ekleniyor...' : !selectedSizeId ? 'Beden Seçin' : !selectedVariant?.inStock ? 'Tükendi' : 'Sepete Ekle'}
            </button>
            <button className="p-3.5 border border-neutral-200 rounded-xl hover:bg-neutral-50"><Heart className="w-5 h-5" /></button>
            <button className="p-3.5 border border-neutral-200 rounded-xl hover:bg-neutral-50"><Share2 className="w-5 h-5" /></button>
          </div>

          {selectedVariant && (
            <p className={`text-sm ${selectedVariant.inStock ? 'text-green-600' : 'text-red-500'}`}>
              {selectedVariant.inStock ? `Stokta ${selectedVariant.stockQuantity} adet` : 'Stokta yok'}
            </p>
          )}

          {product.description && (
            <div className="border-t border-neutral-100 pt-5">
              <h2 className="text-sm font-semibold text-neutral-700 mb-2">Ürün Açıklaması</h2>
              <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {product.attributes.length > 0 && (
            <div className="border-t border-neutral-100 pt-5">
              <h2 className="text-sm font-semibold text-neutral-700 mb-2">Ürün Özellikleri</h2>
              <dl className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                {product.attributes.map((attr) => (
                  <div key={attr.attrKey}>
                    <dt className="text-neutral-500">{attr.attrKey}</dt>
                    <dd className="font-medium text-neutral-800">{attr.attrValue}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {product.tags.map((tag) => (
                <span key={tag} className="text-xs bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
