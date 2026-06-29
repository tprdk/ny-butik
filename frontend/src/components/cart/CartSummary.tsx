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

export function CartSummary({ cart, onApplyCoupon, onRemoveCoupon, onCheckout, isCouponLoading, couponError }: Props) {
  const [couponCode, setCouponCode] = useState('')

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault()
    if (couponCode.trim()) { onApplyCoupon(couponCode.trim().toUpperCase()); setCouponCode('') }
  }

  return (
    <div className="space-y-4">
      {/* Kupon */}
      {cart.coupon ? (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2.5">
          <div className="flex items-center gap-2 text-green-700 text-sm">
            <Tag size={13} strokeWidth={1.5} />
            <span className="font-medium">{cart.coupon.code}</span>
            <span className="text-green-600 font-light">
              {cart.coupon.discountType === 'PERCENTAGE' ? `%${cart.coupon.discountValue} indirim` : `${formatPrice(cart.coupon.discountValue)} indirim`}
            </span>
          </div>
          <button onClick={onRemoveCoupon} className="text-green-600 hover:text-green-800 transition-colors">
            <X size={13} strokeWidth={1.5} />
          </button>
        </div>
      ) : (
        <form onSubmit={handleApply} className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Kupon kodu"
            className="flex-1 border border-border bg-background px-3 py-2 text-xs tracking-wide focus:outline-none focus:ring-1 focus:ring-foreground/20"
          />
          <button
            type="submit"
            disabled={!couponCode.trim() || isCouponLoading}
            className="bg-foreground text-background px-3 py-2 text-xs font-medium hover:bg-stone-700 disabled:opacity-40 transition-colors"
          >
            Uygula
          </button>
        </form>
      )}
      {couponError && <p className="text-xs text-destructive">{couponError}</p>}

      {/* Tutar özeti */}
      <div className="space-y-2 border-t border-border pt-4 text-sm">
        <div className="flex justify-between text-muted-foreground font-light">
          <span>Ara toplam</span><span>{formatPrice(cart.subtotal)}</span>
        </div>
        {cart.discountAmount > 0 && (
          <div className="flex justify-between text-green-700 font-light">
            <span>İndirim</span><span>-{formatPrice(cart.discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground font-light">
          <span>Kargo</span>
          <span>{cart.shippingAmount === 0 ? <span className="text-green-700">Ücretsiz</span> : formatPrice(cart.shippingAmount)}</span>
        </div>
        {cart.shippingAmount > 0 && (
          <p className="text-[11px] text-muted-foreground/60">500 ₺ ve üzeri alışverişlerde kargo ücretsiz</p>
        )}
        <div className="flex justify-between border-t border-border pt-2 font-medium text-foreground">
          <span>Toplam</span><span>{formatPrice(cart.total)}</span>
        </div>
      </div>

      {onCheckout && (
        <button
          onClick={onCheckout}
          disabled={cart.items.length === 0}
          className="btn-primary w-full justify-center py-3.5"
        >
          Ödemeye Geç
        </button>
      )}
    </div>
  )
}
