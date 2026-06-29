import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cart.store'
import { useCart } from '@/hooks/useCart'
import { CartItemRow } from './CartItemRow'
import { CartSummary } from './CartSummary'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/api.types'

export function CartDrawer() {
  const { isOpen, close } = useCartStore()
  const navigate = useNavigate()
  const { cart, isLoading, updateItem, removeItem, applyCoupon, removeCoupon } = useCart()
  const [couponError, setCouponError] = useState<string | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [close])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleApplyCoupon = async (code: string) => {
    setCouponError(null)
    try {
      await applyCoupon.mutateAsync(code)
    } catch (err) {
      const msg = (err as AxiosError<ApiError>).response?.data?.detail
      setCouponError(msg ?? 'Kupon uygulanamadı')
    }
  }

  const handleCheckout = () => { close(); navigate('/odeme') }
  const isEmpty = !cart || cart.items.length === 0

  if (!isOpen) return null

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-brand-dark/60 backdrop-blur-sm"
        style={{ zIndex: 9998 }}
        onClick={close}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-background"
        style={{ zIndex: 9999, boxShadow: '-20px 0 60px rgba(28,22,18,0.15)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={16} strokeWidth={1.5} className="text-foreground/50" />
            <h2 className="text-sm font-medium tracking-wide text-foreground">
              Sepetim
              {cart && cart.items.length > 0 && (
                <span className="ml-2 text-xs font-light text-muted-foreground">
                  ({cart.items.reduce((s, i) => s + i.quantity, 0)} ürün)
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={close}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Sepeti kapat"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* İçerik */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border border-foreground/20 border-t-foreground/70" />
            </div>
          ) : isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center gap-5 px-6 py-16 text-center">
              <ShoppingBag size={40} strokeWidth={1} className="text-border" />
              <div>
                <p className="text-sm font-light text-foreground mb-1">Sepetiniz boş</p>
                <p className="text-xs text-muted-foreground">Beğendiğiniz ürünleri sepete ekleyin.</p>
              </div>
              <button
                onClick={() => { close(); navigate('/urunler') }}
                className="btn-primary btn-sm"
              >
                Alışverişe Başla
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border px-6">
              {cart.items.map((item) => (
                <CartItemRow
                  key={item.variantId}
                  item={item}
                  onUpdate={(vid, qty) => updateItem.mutate({ variantId: vid, quantity: qty })}
                  onRemove={(vid) => removeItem.mutate(vid)}
                  isUpdating={updateItem.isPending || removeItem.isPending}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isEmpty && cart && (
          <div className="border-t border-border bg-accent/40 px-6 py-5">
            <CartSummary
              cart={cart}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={() => { setCouponError(null); removeCoupon.mutate() }}
              onCheckout={handleCheckout}
              isCouponLoading={applyCoupon.isPending}
              couponError={couponError}
              showViewCart
              onViewCart={close}
            />
          </div>
        )}
      </div>
    </>,
    document.body
  )
}
