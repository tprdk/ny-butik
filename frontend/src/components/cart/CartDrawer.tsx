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

  // ESC ile kapat
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [close])

  // Scroll kilitle
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
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

  const handleCheckout = () => {
    close()
    navigate('/odeme')
  }

  const isEmpty = !cart || cart.items.length === 0

  if (!isOpen) return null

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50"
        style={{ zIndex: 9998 }}
        onClick={close}
      />

      {/* Drawer panel */}
      <div
        className="fixed right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        style={{ zIndex: 9999 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-rose-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Sepetim
              {cart && cart.items.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({cart.items.reduce((s, i) => s + i.quantity, 0)} ürün)
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={close}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Sepeti kapat"
          >
            <X size={20} />
          </button>
        </div>

        {/* İçerik */}
        <div className="flex-1 overflow-y-auto px-6">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
            </div>
          ) : isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
              <ShoppingBag size={48} className="text-gray-200" />
              <p className="text-gray-500">Sepetiniz boş</p>
              <button
                onClick={() => { close(); navigate('/urunler') }}
                className="rounded-lg bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 transition-colors"
              >
                Alışverişe Başla
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
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
          <div className="border-t bg-gray-50 px-6 py-4">
            <CartSummary
              cart={cart}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={() => { setCouponError(null); removeCoupon.mutate() }}
              onCheckout={handleCheckout}
              isCouponLoading={applyCoupon.isPending}
              couponError={couponError}
            />
          </div>
        )}
      </div>
    </>,
    document.body
  )
}
