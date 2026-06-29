import { Minus, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPrice } from '@/lib/format'
import type { CartItem } from '@/types/cart.types'

interface Props {
  item: CartItem
  onUpdate: (variantId: number, quantity: number) => void
  onRemove: (variantId: number) => void
  isUpdating?: boolean
}

export function CartItemRow({ item, onUpdate, onRemove, isUpdating }: Props) {
  const variantLabel = [item.colorName, item.sizeName].filter(Boolean).join(' / ')

  return (
    <div className="flex gap-3 py-4">
      <Link to={`/urunler/${item.productSlug}`} className="shrink-0">
        <img
          src={item.imageUrl ?? '/placeholder-product.png'}
          alt={item.productName}
          className="h-20 w-16 rounded-md object-cover bg-gray-100"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <Link
          to={`/urunler/${item.productSlug}`}
          className="text-sm font-medium text-gray-900 hover:text-rose-600 line-clamp-2 leading-snug"
        >
          {item.productName}
        </Link>

        {variantLabel && (
          <p className="text-xs text-gray-500">{variantLabel}</p>
        )}

        <p className="text-xs text-gray-400">SKU: {item.sku}</p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-md border border-gray-200">
            <button
              onClick={() => onUpdate(item.variantId, item.quantity - 1)}
              disabled={item.quantity <= 1 || isUpdating}
              className="p-1.5 text-gray-600 hover:text-rose-600 disabled:opacity-40 transition-colors"
              aria-label="Azalt"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <button
              onClick={() => onUpdate(item.variantId, item.quantity + 1)}
              disabled={isUpdating}
              className="p-1.5 text-gray-600 hover:text-rose-600 disabled:opacity-40 transition-colors"
              aria-label="Artır"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900">
              {formatPrice(item.lineTotal)}
            </span>
            <button
              onClick={() => onRemove(item.variantId)}
              disabled={isUpdating}
              className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
              aria-label="Kaldır"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
