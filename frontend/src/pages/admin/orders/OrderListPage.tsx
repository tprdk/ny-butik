import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { orderApi } from '@/api/order.api'
import { formatPrice, formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types/order.types'

const STATUS_TABS: { label: string; value?: string }[] = [
  { label: 'Tümü' },
  { label: 'Onaylandı', value: 'CONFIRMED' },
  { label: 'Hazırlanıyor', value: 'PREPARING' },
  { label: 'Kargoda', value: 'SHIPPED' },
  { label: 'Teslim Edildi', value: 'DELIVERED' },
  { label: 'İptal', value: 'CANCELLED' },
]

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

export default function AdminOrderListPage() {
  const [activeStatus, setActiveStatus] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(0)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminOrders', activeStatus, page],
    queryFn: () => orderApi.adminGetOrders(activeStatus, page, 20),
  })

  const handleTabChange = (value?: string) => {
    setActiveStatus(value)
    setPage(0)
  }

  return (
    <>
      <Helmet>
        <title>Siparişler — NY Butik Admin</title>
      </Helmet>

      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Siparişler</h1>

        {/* Status filter tabs */}
        <div className="mb-4 flex flex-wrap gap-2 border-b pb-3">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => handleTabChange(tab.value)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                activeStatus === tab.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

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

        {!isLoading && data && (
          <>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Sipariş No
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Tarih</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Ürün</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Durum</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Tutar</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                      İşlem
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.content.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        Bu filtreye göre sipariş bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    data.content.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium text-gray-900">
                          {order.orderNumber}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {formatDateTime(order.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{order.itemCount} ürün</td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'rounded-full px-2.5 py-0.5 text-xs font-medium',
                              orderStatusClass(order.status)
                            )}
                          >
                            {orderStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Link
                            to={`/admin/siparisler/${order.id}`}
                            className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 transition-colors"
                          >
                            Detay
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Toplam {data.totalElements} sipariş
                </p>
                <div className="flex items-center gap-2">
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
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
