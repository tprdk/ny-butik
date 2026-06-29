import { useState } from 'react'
import { Tag, X } from 'lucide-react'
import { formatPrice } from '@/lib/format'
import type { Cart } from '@/types/cart.types'

interface Props {
  cart: Cart
  onApplyCoupon: (code: string) => void
  onRemoveCoupon: () => void
  onCheckout?: () => void
  isCouponLoading?: boolean
  couponError?: string | null
}

export function CartSummary({
  cart,
  onApplyCoupon,
  onRemoveCoupon,
  onCheckout,
  isCouponLoading,
  couponError,
}: Props) {
  const [couponCode, setCouponCode] = useState('')

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault()
    if (couponCode.trim()) {
      onApplyCoupon(couponCode.trim().toUpperCase())
      setCouponCode('')
    }
  }

  return (
    <div className="space-y-4">
      {/* Kupon */}
      {cart.coupon ? (
        <div className="flex items-center justify-between rounded-md bg-green-50 px-3 py-2 text-sm">
          <div className="flex items-center gap-2 text-green-700">
            <Tag size={14} />
            <span className="font-medium">{cart.coupon.code}</span>
            <span className="text-green-600">
              {cart.coupon.discountType === 'PERCENTAGE'
                ? `%${cart.coupon.discountValue} indirim`
                : `${formatPrice(cart.coupon.discountValue)} indirim`}
            </span>
          </div>
          <button onClick={onRemoveCoupon} className="text-green-600 hover:text-green-800">
            <X size={14} />
          </button>
        </div>
      ) : (
        <form onSubmit={handleApply} className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Kupon kodu"
            className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
          <button
            type="submit"
            disabled={!couponCode.trim() || isCouponLoading}
            className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            Uygula
          </button>
        </form>
      )}
      {couponError && <p className="text-xs text-red-500">{couponError}</p>}

      {/* Tutar özeti */}
      <div className="space-y-2 border-t pt-4 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Ara toplam</span>
          <span>{formatPrice(cart.subtotal)}</span>
        </div>
        {cart.discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>İndirim</span>
            <span>-{formatPrice(cart.discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>Kargo</span>
          <span>
            {cart.shippingAmount === 0 ? (
              <span className="text-green-600 font-medium">Ücretsiz</span>
            ) : (
              formatPrice(cart.shippingAmount)
            )}
          </span>
        </div>
        {cart.shippingAmount > 0 && (
          <p className="text-xs text-gray-400">
            ₺500 ve üzeri alışverişlerde kargo ücretsiz
          </p>
        )}
        <div className="flex justify-between border-t pt-2 text-base font-semibold text-gray-900">
          <span>Toplam</span>
          <span>{formatPrice(cart.total)}</span>
        </div>
      </div>

      {onCheckout && (
        <button
          onClick={onCheckout}
          disabled={cart.items.length === 0}
          className="w-full rounded-lg bg-rose-600 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
        >
          Ödemeye Geç
        </button>
      )}
    </div>
  )
}
