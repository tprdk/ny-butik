import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/dashboard.api'
import StatCard from '@/components/admin/StatCard'
import { formatPrice, formatDateTime } from '@/lib/format'

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Ödeme Bekliyor',
  PAYMENT_PROCESSING: 'İşleniyor',
  PAYMENT_FAILED: 'Ödeme Başarısız',
  CONFIRMED: 'Onaylandı',
  PREPARING: 'Hazırlanıyor',
  SHIPPED: 'Kargoda',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal',
  RETURN_REQUESTED: 'İade Talebi',
  RETURNED: 'İade Edildi',
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: dashboardApi.getStats,
    refetchInterval: 60_000,
  })

  return (
    <>
      <Helmet><title>Dashboard — NY Butik Admin</title></Helmet>

      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard
                title="Toplam Sipariş"
                value={data.totalOrders.toLocaleString('tr-TR')}
                sub={`Bugün: +${data.todayOrders}`}
                color="blue"
              />
              <StatCard
                title="Toplam Gelir"
                value={formatPrice(data.totalRevenue)}
                sub={`Bugün: ${formatPrice(data.todayRevenue)}`}
                color="green"
              />
              <StatCard
                title="Ürün Sayısı"
                value={data.totalProducts.toLocaleString('tr-TR')}
                sub={`Düşük stok: ${data.lowStockProducts}`}
                color="orange"
              />
              <StatCard
                title="Müşteri Sayısı"
                value={data.totalCustomers.toLocaleString('tr-TR')}
                sub={`Bugün yeni: +${data.newCustomersToday}`}
                color="blue"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border bg-white p-4">
                <h2 className="mb-4 font-semibold text-gray-800">Son Siparişler</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="pb-2 pr-4">Sipariş No</th>
                        <th className="pb-2 pr-4">Müşteri</th>
                        <th className="pb-2 pr-4">Tutar</th>
                        <th className="pb-2 pr-4">Durum</th>
                        <th className="pb-2">Tarih</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.recentOrders.map((o) => (
                        <tr key={o.id} className="text-gray-700">
                          <td className="py-2 pr-4 font-mono text-xs">{o.orderNumber}</td>
                          <td className="py-2 pr-4">{o.customerName}</td>
                          <td className="py-2 pr-4 font-medium">{formatPrice(o.totalAmount)}</td>
                          <td className="py-2 pr-4">
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                              {ORDER_STATUS_LABELS[o.status] ?? o.status}
                            </span>
                          </td>
                          <td className="py-2 text-xs text-gray-400">{formatDateTime(o.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-lg border bg-white p-4">
                <h2 className="mb-4 font-semibold text-gray-800">Son 30 Günde En Çok Satılanlar</h2>
                <div className="space-y-3">
                  {data.topProducts.length === 0 ? (
                    <p className="text-sm text-gray-400">Henüz satış verisi yok.</p>
                  ) : (
                    data.topProducts.map((p, idx) => (
                      <div key={p.productId} className="flex items-center gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-800">{p.productName}</p>
                          <p className="text-xs text-gray-400">{p.totalSold} adet satıldı</p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-green-700">
                          {formatPrice(p.totalRevenue)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  )
}
