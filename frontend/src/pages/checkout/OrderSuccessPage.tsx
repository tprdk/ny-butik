import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { CheckCheck, Package, Truck, Clock, ShoppingBag } from 'lucide-react'
import { orderApi } from '@/api/order.api'
import { formatPrice, formatDate } from '@/lib/format'

export default function OrderSuccessPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>()

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => orderApi.getMyOrder(orderNumber!),
    enabled: !!orderNumber,
  })

  return (
    <>
      <Helmet>
        <title>Sipariş Alındı — NY Butik</title>
      </Helmet>

      <div className="bg-background flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {isLoading ? (
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-pulse bg-border" />
            </div>
          ) : (
            <div className="bg-white border border-border p-8 sm:p-10">
              {/* Success mark */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center bg-foreground shrink-0">
                  <CheckCheck className="h-5 w-5 text-background" strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="font-serif text-2xl font-light text-foreground">Siparişiniz Alındı</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">En kısa sürede hazırlanacak</p>
                </div>
              </div>

              {order && (
                <>
                  {/* Order number */}
                  <div className="border border-border p-4 mb-5 bg-accent/40">
                    <p className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-1">Sipariş Numarası</p>
                    <p className="font-mono text-lg font-medium text-foreground tracking-wider">
                      {order.orderNumber}
                    </p>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-px bg-border mb-5">
                    <div className="bg-white p-4 text-center">
                      <Package className="mx-auto mb-2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                      <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground">Ürün</p>
                      <p className="text-base font-light text-foreground mt-0.5">{order.items.length}</p>
                    </div>
                    <div className="bg-white p-4 text-center">
                      <Truck className="mx-auto mb-2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                      <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground">Kargo</p>
                      <p className="text-base font-light text-foreground mt-0.5">
                        {order.shippingAmount === 0 ? 'Ücretsiz' : formatPrice(order.shippingAmount)}
                      </p>
                    </div>
                    <div className="bg-white p-4 text-center">
                      <Clock className="mx-auto mb-2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                      <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground">Tarih</p>
                      <p className="text-base font-light text-foreground mt-0.5">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between py-4 border-t border-b border-border mb-6">
                    <span className="text-sm text-muted-foreground">Toplam Tutar</span>
                    <span className="text-xl font-light text-foreground">{formatPrice(order.totalAmount)}</span>
                  </div>

                  {order.shipment?.estimatedDelivery && (
                    <p className="text-xs text-muted-foreground mb-6 text-center">
                      Tahmini Teslimat:{' '}
                      <span className="text-foreground font-medium">{formatDate(order.shipment.estimatedDelivery)}</span>
                    </p>
                  )}
                </>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/hesabim/siparisler"
                  className="btn-outline flex-1 text-center"
                >
                  Siparişlerim
                </Link>
                <Link
                  to="/urunler"
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={14} strokeWidth={1.5} />
                  Alışverişe Devam
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
