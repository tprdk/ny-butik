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

      <div className="container-site py-10">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2">
          <Link
            to="/urunler"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={12} strokeWidth={1.5} />
            Alışverişe Devam Et
          </Link>
        </div>

        <h1 className="font-serif text-2xl font-light text-foreground mb-8">
          Sepetim
          {cart && cart.items.length > 0 && (
            <span className="ml-3 text-sm font-sans font-light text-muted-foreground">
              {cart.items.reduce((s, i) => s + i.quantity, 0)} ürün
            </span>
          )}
        </h1>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border border-foreground/20 border-t-foreground/60" />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-5 py-28 text-center border border-dashed border-border">
            <ShoppingBag size={44} strokeWidth={1} className="text-border" />
            <div>
              <p className="text-sm font-light text-foreground mb-1">Sepetiniz boş</p>
              <p className="text-xs text-muted-foreground">Beğendiğiniz ürünleri sepetinize ekleyin.</p>
            </div>
            <Link to="/urunler" className="btn-primary btn-sm">
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Ürünler */}
            <div className="lg:col-span-2">
              <div className="border border-border divide-y divide-border">
                {cart.items.map((item) => (
                  <div key={item.variantId} className="px-5">
                    <CartItemRow
                      item={item}
                      onUpdate={(vid, qty) => updateItem.mutate({ variantId: vid, quantity: qty })}
                      onRemove={(vid) => removeItem.mutate(vid)}
                      isUpdating={updateItem.isPending || removeItem.isPending}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Özet */}
            <div className="border border-border p-6 self-start">
              <h2 className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-5">Sipariş Özeti</h2>
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
