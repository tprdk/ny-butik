import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import type { ProductSummary } from '@/types/catalog.types'
import { formatPrice } from '@/lib/format'
import { useWishlist } from '@/hooks/useWishlist'
import { cn } from '@/lib/utils'

interface Props {
  product: ProductSummary
}

export function ProductCard({ product }: Props) {
  const hasDiscount = product.minSalePrice != null && product.minPrice != null
  const { isWishlisted, toggle, isPending } = useWishlist()
  const wishlisted = isWishlisted(product.id)

  return (
    <Link
      to={`/urunler/${product.slug}`}
      className="group relative flex flex-col bg-white overflow-hidden transition-shadow duration-300 hover:shadow-card-hover"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] bg-brand-sand overflow-hidden">
        {product.primaryImageUrl ? (
          <img
            src={product.primaryImageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-brand-earth text-white text-[10px] font-medium tracking-wider uppercase px-2.5 py-1">
            İndirim
          </span>
        )}

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs tracking-widest uppercase text-foreground/50 font-medium">Tükendi</span>
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product.id) }}
          disabled={isPending}
          className={cn(
            'absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm shadow-subtle transition-all duration-200 disabled:opacity-60',
            wishlisted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}
          aria-label={wishlisted ? 'Favorilerden çıkar' : 'Favorilere ekle'}
        >
          <Heart
            className={cn(
              'w-3.5 h-3.5 transition-colors',
              wishlisted ? 'fill-brand-earth text-brand-earth' : 'text-foreground/50'
            )}
          />
        </button>
      </div>

      {/* Info */}
      <div className="pt-3 pb-4 px-0.5">
        <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mb-1">
          {product.category.name}
        </p>
        <h3 className="text-sm font-light text-foreground leading-snug line-clamp-2 mb-2">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          {hasDiscount ? (
            <>
              <span className="text-sm font-medium text-brand-earth">
                {formatPrice(product.minSalePrice!)}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.minPrice!)}
              </span>
            </>
          ) : (
            <span className="text-sm font-medium text-foreground">
              {product.minPrice != null ? formatPrice(product.minPrice) : '—'}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
