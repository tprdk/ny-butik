import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { Package, ChevronRight } from 'lucide-react'
import { orderApi } from '@/api/order.api'
import { formatPrice, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types/order.types'

function orderStatusLabel(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    PENDING_PAYMENT: 'Ödeme Bekleniyor',
    PAYMENT_PROCESSING: 'Ödeme İşleniyor',
    PAYMENT_FAILED: 'Ödeme Başarısız',
    CONFIRMED: 'Onaylandı',
    PREPARING: 'Hazırlanıyor',
    SHIPPED: 'Kargoya Verildi',
    DELIVERED: 'Teslim Edildi',
    CANCELLED: 'İptal Edildi',
    RETURN_REQUESTED: 'İade Talebi',
    RETURNED: 'İade Edildi',
  }
  return map[status] ?? status
}

function orderStatusClass(status: OrderStatus): string {
  switch (status) {
    case 'CONFIRMED':
    case 'PREPARING':
      return 'bg-yellow-100 text-yellow-800'
    case 'SHIPPED':
      return 'bg-blue-100 text-blue-800'
    case 'DELIVERED':
      return 'bg-green-100 text-green-800'
    case 'CANCELLED':
    case 'PAYMENT_FAILED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export default function OrdersPage() {
  const [page, setPage] = useState(0)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['myOrders', page],
    queryFn: () => orderApi.getMyOrders(page, 10),
  })

  return (
    <>
      <Helmet>
        <title>Siparişlerim — NY Butik</title>
      </Helmet>

      <div>
        <h1 className="mb-6 text-xl font-bold text-gray-900">Siparişlerim</h1>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
          </div>
        )}

        {isError && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
            Siparişler yüklenirken bir hata oluştu.
          </div>
        )}

        {!isLoading && data && data.content.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <Package className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <p className="font-medium text-gray-700">Henüz siparişiniz yok</p>
            <p className="mt-1 text-sm text-gray-500">
              İlk siparişinizi vermek için ürünleri inceleyin.
            </p>
            <Link
              to="/urunler"
              className="mt-4 inline-block rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 transition-colors"
            >
              Ürünlere Göz At
            </Link>
          </div>
        )}

        {!isLoading && data && data.content.length > 0 && (
          <>
            <div className="space-y-3">
              {data.content.map((order) => (
                <Link
                  key={order.id}
                  to={`/hesabim/siparisler/${order.orderNumber}`}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      <Package size={20} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.createdAt)} · {order.itemCount} ürün
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatPrice(order.totalAmount)}</p>
                      <span
                        className={cn(
                          'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                          orderStatusClass(order.status)
                        )}
                      >
                        {orderStatusLabel(order.status)}
                      </span>
                    </div>
                    <ChevronRight size={18} className="text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Önceki
                </button>
                <span className="text-sm text-gray-500">
                  {page + 1} / {data.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
                  disabled={data.last}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Sonraki
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
