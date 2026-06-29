import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, Package, Truck, Clock, ShoppingBag } from 'lucide-react'
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

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {isLoading ? (
            <div className="flex justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-8 shadow-sm text-center">
              {/* Success icon */}
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900">Siparişiniz Alındı!</h1>
              <p className="mt-2 text-gray-500">
                Siparişiniz başarıyla oluşturuldu. En kısa sürede hazırlanacak.
              </p>

              {order && (
                <>
                  {/* Order number */}
                  <div className="mt-6 rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Sipariş Numarası</p>
                    <p className="mt-1 text-xl font-bold tracking-wide text-rose-600">
                      {order.orderNumber}
                    </p>
                  </div>

                  {/* Order details */}
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <Package className="mx-auto mb-1 h-5 w-5 text-gray-400" />
                      <p className="text-xs text-gray-500">Ürün Sayısı</p>
                      <p className="font-semibold text-gray-900">{order.items.length}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <Truck className="mx-auto mb-1 h-5 w-5 text-gray-400" />
                      <p className="text-xs text-gray-500">Kargo</p>
                      <p className="font-semibold text-gray-900">
                        {order.shippingAmount === 0 ? 'Ücretsiz' : formatPrice(order.shippingAmount)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <Clock className="mx-auto mb-1 h-5 w-5 text-gray-400" />
                      <p className="text-xs text-gray-500">Tarih</p>
                      <p className="font-semibold text-gray-900">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <span className="font-medium text-gray-700">Toplam Tutar</span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>

                  {/* Estimated delivery */}
                  {order.shipment?.estimatedDelivery && (
                    <div className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                      <p>
                        Tahmini Teslimat:{' '}
                        <strong>{formatDate(order.shipment.estimatedDelivery)}</strong>
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Action buttons */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/hesabim/siparisler"
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Siparişlerim
                </Link>
                <Link
                  to="/urunler"
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700 transition-colors"
                >
                  <ShoppingBag size={16} />
                  Alışverişe Devam Et
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
