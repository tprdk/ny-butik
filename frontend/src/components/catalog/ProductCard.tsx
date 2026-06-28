import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import type { ProductSummary } from '@/types/catalog.types'
import { formatPrice } from '@/lib/format'

interface Props {
  product: ProductSummary
}

export function ProductCard({ product }: Props) {
  const hasDiscount = product.minSalePrice != null && product.minPrice != null

  return (
    <Link
      to={`/urunler/${product.slug}`}
      className="group flex flex-col bg-white rounded-xl overflow-hidden border border-neutral-100 hover:shadow-lg transition-shadow duration-200"
    >
      <div className="relative aspect-[3/4] bg-neutral-50 overflow-hidden">
        {product.primaryImageUrl ? (
          <img
            src={product.primaryImageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            İndirim
          </span>
        )}

        {!product.inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-sm font-medium text-neutral-500">Tükendi</span>
          </div>
        )}

        <button
          onClick={(e) => { e.preventDefault() }}
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-500"
          aria-label="Favorilere ekle"
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 flex flex-col gap-1">
        <p className="text-xs text-neutral-400">{product.category.name}</p>
        <h3 className="text-sm font-medium text-neutral-900 line-clamp-2 leading-snug">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          {hasDiscount ? (
            <>
              <span className="text-sm font-bold text-rose-600">
                {formatPrice(product.minSalePrice!)}
              </span>
              <span className="text-xs text-neutral-400 line-through">
                {formatPrice(product.minPrice!)}
              </span>
            </>
          ) : (
            <span className="text-sm font-bold text-neutral-900">
              {product.minPrice != null ? formatPrice(product.minPrice) : '—'}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
