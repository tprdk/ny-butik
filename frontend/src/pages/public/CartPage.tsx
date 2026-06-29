import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { CartItemRow } from '@/components/cart/CartItemRow'
import { CartSummary } from '@/components/cart/CartSummary'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/api.types'

export default function CartPage() {
  const navigate = useNavigate()
  const { cart, isLoading, updateItem, removeItem, applyCoupon, removeCoupon } = useCart()
  const [couponError, setCouponError] = useState<string | null>(null)

  const handleApplyCoupon = async (code: string) => {
    setCouponError(null)
    try {
      await applyCoupon.mutateAsync(code)
    } catch (err) {
      const msg = (err as AxiosError<ApiError>).response?.data?.detail
      setCouponError(msg ?? 'Kupon uygulanamadı')
    }
  }

  const isEmpty = !cart || cart.items.length === 0

  return (
    <>
      <Helmet><title>Sepetim — NY Butik</title></Helmet>

      <div className="container py-8 md:py-12">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-900 transition-colors"
            aria-label="Geri"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Sepetim</h1>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
            <ShoppingBag size={64} className="text-gray-200" />
            <div>
              <p className="text-xl font-semibold text-gray-900">Sepetiniz boş</p>
              <p className="mt-1 text-gray-500">Beğendiğiniz ürünleri sepetinize ekleyin</p>
            </div>
            <Link
              to="/urunler"
              className="rounded-lg bg-rose-600 px-8 py-3 text-sm font-semibold text-white hover:bg-rose-700 transition-colors"
            >
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-gray-200 bg-white">
                <div className="divide-y divide-gray-100 px-6">
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
              </div>
              <Link
                to="/urunler"
                className="mt-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={16} />
                Alışverişe Devam Et
              </Link>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-base font-semibold text-gray-900">Sipariş Özeti</h2>
              <CartSummary
                cart={cart}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={() => { setCouponError(null); removeCoupon.mutate() }}
                onCheckout={() => navigate('/odeme')}
                isCouponLoading={applyCoupon.isPending}
                couponError={couponError}
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
