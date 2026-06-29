import { Helmet } from 'react-helmet-async'
import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingBag, Heart, ChevronRight } from 'lucide-react'
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
    <div className="container-site py-10">
      <Helmet><title>Yükleniyor... — NY Butik</title></Helmet>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
        <div className="aspect-[3/4] bg-brand-sand animate-pulse" />
        <div className="flex flex-col gap-5 animate-pulse pt-4">
          {[60, 40, 24, 80, 32].map((w, i) => (
            <div key={i} className={`h-5 bg-border rounded-sm`} style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  )

  if (isError || !product) return (
    <div className="container-site py-24 text-center">
      <Helmet><title>Ürün Bulunamadı — NY Butik</title></Helmet>
      <p className="text-muted-foreground font-light mb-4">Ürün bulunamadı.</p>
      <Link to="/urunler" className="text-sm text-foreground underline underline-offset-4">Ürünlere dön</Link>
    </div>
  )

  const displayPrice = selectedVariant?.effectivePrice ?? product.variants[0]?.effectivePrice
  const displayOriginal = selectedVariant?.salePrice != null ? selectedVariant.price
    : product.variants[0]?.salePrice != null ? product.variants[0].price : undefined

  return (
    <div className="container-site py-10">
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

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[11px] tracking-wide text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground transition-colors">Ana Sayfa</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/urunler" className="hover:text-foreground transition-colors">Ürünler</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
        <ImageGallery images={product.images} productName={product.name} />

        <div className="flex flex-col gap-6">
          {/* Başlık & fiyat */}
          <div>
            <p className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-2">
              {product.category.name}
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-foreground leading-tight mb-4">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-light text-foreground">
                {displayPrice != null ? formatPrice(displayPrice) : '—'}
              </span>
              {displayOriginal && (
                <span className="text-base text-muted-foreground line-through font-light">
                  {formatPrice(displayOriginal)}
                </span>
              )}
              {displayOriginal && displayPrice && (
                <span className="text-xs text-brand-earth font-medium">
                  {Math.round((1 - displayPrice / displayOriginal) * 100)}% indirim
                </span>
              )}
            </div>
          </div>

          {product.shortDesc && (
            <p className="text-sm text-muted-foreground leading-relaxed font-light border-t border-border pt-5">
              {product.shortDesc}
            </p>
          )}

          {/* Renk */}
          {colors.length > 0 && (
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">
                Renk{selectedColorId ? ` — ${colors.find((c) => c.id === selectedColorId)?.name}` : ''}
              </p>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => (
                  <ColorSwatch
                    key={color.id}
                    color={color}
                    selected={selectedColorId === color.id}
                    onClick={() => {
                      setSelectedColorId(color.id === selectedColorId ? undefined : color.id)
                      setSelectedSizeId(undefined)
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Beden */}
          {sizes.length > 0 && (
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">Beden</p>
              <SizeSelector
                sizes={sizes}
                selectedId={selectedSizeId}
                disabledIds={outOfStockSizeIds}
                onSelect={(s) => setSelectedSizeId(s.id === selectedSizeId ? undefined : s.id)}
              />
            </div>
          )}

          {/* Stok bilgisi */}
          {selectedVariant && (
            <p className={`text-xs tracking-wide ${selectedVariant.inStock ? 'text-green-700' : 'text-destructive'}`}>
              {selectedVariant.inStock
                ? `${selectedVariant.stockQuantity} adet stokta`
                : 'Stokta bulunmuyor'}
            </p>
          )}

          {/* CTA butonları */}
          <div className="flex gap-3 pt-2">
            <button
              disabled={!selectedVariant || !selectedVariant.inStock || addItem.isPending}
              onClick={() => {
                if (!selectedVariant) return
                addItem.mutate({ variantId: selectedVariant.id, quantity: 1 }, { onSuccess: openCart })
              }}
              className="flex-1 flex items-center justify-center gap-2.5 bg-foreground text-background py-4 px-6 text-sm font-medium tracking-wide hover:bg-stone-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
              {addItem.isPending
                ? 'Ekleniyor...'
                : !selectedSizeId
                ? 'Beden Seçin'
                : !selectedVariant?.inStock
                ? 'Tükendi'
                : 'Sepete Ekle'}
            </button>
            <button
              className="p-4 border border-border hover:bg-accent transition-colors"
              aria-label="Favorilere ekle"
            >
              <Heart className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Açıklama */}
          {product.description && (
            <div className="border-t border-border pt-6 mt-2">
              <h2 className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-3">
                Ürün Açıklaması
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-light whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Özellikler */}
          {product.attributes.length > 0 && (
            <div className="border-t border-border pt-6">
              <h2 className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-3">
                Ürün Özellikleri
              </h2>
              <dl className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                {product.attributes.map((attr) => (
                  <div key={attr.attrKey}>
                    <dt className="text-xs text-muted-foreground mb-0.5">{attr.attrKey}</dt>
                    <dd className="font-light text-foreground">{attr.attrValue}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Etiketler */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {product.tags.map((tag) => (
                <span key={tag} className="text-[10px] tracking-wide uppercase bg-accent text-muted-foreground px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
