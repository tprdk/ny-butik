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
        <h1 className="font-serif text-2xl font-light text-foreground">Dashboard</h1>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse bg-accent border border-border" />
            ))}
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard title="Toplam Sipariş" value={data.totalOrders.toLocaleString('tr-TR')} sub={`Bugün: +${data.todayOrders}`} color="blue" />
              <StatCard title="Toplam Gelir" value={formatPrice(data.totalRevenue)} sub={`Bugün: ${formatPrice(data.todayRevenue)}`} color="green" />
              <StatCard title="Ürün Sayısı" value={data.totalProducts.toLocaleString('tr-TR')} sub={`Düşük stok: ${data.lowStockProducts}`} color="orange" />
              <StatCard title="Müşteri Sayısı" value={data.totalCustomers.toLocaleString('tr-TR')} sub={`Bugün yeni: +${data.newCustomersToday}`} color="blue" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="border border-border">
                <div className="px-4 py-3 border-b border-border">
                  <h2 className="text-xs tracking-[0.12em] uppercase text-muted-foreground font-medium">Son Siparişler</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="px-4 pb-2.5 pt-3 text-[10px] tracking-wide uppercase text-muted-foreground font-medium">Sipariş No</th>
                        <th className="px-4 pb-2.5 pt-3 text-[10px] tracking-wide uppercase text-muted-foreground font-medium">Müşteri</th>
                        <th className="px-4 pb-2.5 pt-3 text-[10px] tracking-wide uppercase text-muted-foreground font-medium">Tutar</th>
                        <th className="px-4 pb-2.5 pt-3 text-[10px] tracking-wide uppercase text-muted-foreground font-medium">Durum</th>
                        <th className="px-4 pb-2.5 pt-3 text-[10px] tracking-wide uppercase text-muted-foreground font-medium">Tarih</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.recentOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-accent/50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-foreground">{o.orderNumber}</td>
                          <td className="px-4 py-3 text-sm font-light text-foreground">{o.customerName}</td>
                          <td className="px-4 py-3 text-sm font-light text-foreground">{formatPrice(o.totalAmount)}</td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] tracking-wide uppercase text-muted-foreground bg-accent border border-border px-2 py-0.5">
                              {ORDER_STATUS_LABELS[o.status] ?? o.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTime(o.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border border-border">
                <div className="px-4 py-3 border-b border-border">
                  <h2 className="text-xs tracking-[0.12em] uppercase text-muted-foreground font-medium">Son 30 Günde En Çok Satılanlar</h2>
                </div>
                <div className="p-4 space-y-3">
                  {data.topProducts.length === 0 ? (
                    <p className="text-sm font-light text-muted-foreground">Henüz satış verisi yok.</p>
                  ) : (
                    data.topProducts.map((p, idx) => (
                      <div key={p.productId} className="flex items-center gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center text-xs text-muted-foreground border border-border">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-light text-foreground">{p.productName}</p>
                          <p className="text-xs text-muted-foreground">{p.totalSold} adet satıldı</p>
                        </div>
                        <span className="shrink-0 text-sm font-light text-green-700">{formatPrice(p.totalRevenue)}</span>
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
