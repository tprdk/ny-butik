import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
    PENDING_PAYMENT: 'Ödeme Bekleniyor', PAYMENT_PROCESSING: 'Ödeme İşleniyor', PAYMENT_FAILED: 'Ödeme Başarısız',
    CONFIRMED: 'Onaylandı', PREPARING: 'Hazırlanıyor', SHIPPED: 'Kargoya Verildi',
    DELIVERED: 'Teslim Edildi', CANCELLED: 'İptal Edildi', RETURN_REQUESTED: 'İade Talebi', RETURNED: 'İade Edildi',
  }
  return map[status] ?? status
}

function orderStatusClass(status: OrderStatus): string {
  switch (status) {
    case 'CONFIRMED': case 'PREPARING': return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'SHIPPED': return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'DELIVERED': return 'bg-green-50 text-green-700 border-green-200'
    case 'CANCELLED': case 'PAYMENT_FAILED': return 'bg-red-50 text-red-700 border-red-200'
    default: return 'bg-accent text-muted-foreground border-border'
  }
}

export default function AdminOrderListPage() {
  const [activeStatus, setActiveStatus] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(0)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminOrders', activeStatus, page],
    queryFn: () => orderApi.adminGetOrders(activeStatus, page, 20),
  })

  const handleTabChange = (value?: string) => { setActiveStatus(value); setPage(0) }

  return (
    <>
      <Helmet><title>Siparişler — NY Butik Admin</title></Helmet>

      <div>
        <h1 className="font-serif text-2xl font-light text-foreground mb-6">Siparişler</h1>

        <div className="mb-5 flex flex-wrap gap-1.5 border-b border-border pb-4">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => handleTabChange(tab.value)}
              className={cn(
                'px-3 py-1.5 text-xs tracking-wide transition-colors',
                activeStatus === tab.value
                  ? 'bg-foreground text-background'
                  : 'border border-border text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading && <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse bg-accent border border-border" />)}</div>}

        {isError && <div className="border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">Siparişler yüklenirken bir hata oluştu.</div>}

        {!isLoading && data && (
          <>
            <div className="border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-accent/50">
                    {['Sipariş No', 'Tarih', 'Ürün', 'Durum', 'Tutar', ''].map((h, i) => (
                      <th key={i} className={cn('px-4 py-3 text-[10px] tracking-[0.12em] uppercase text-muted-foreground font-medium', i === 4 && 'text-right', i === 5 && 'text-center')}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.content.length === 0 ? (
                    <tr><td colSpan={6} className="py-10 text-center text-sm font-light text-muted-foreground">Bu filtreye göre sipariş bulunamadı.</td></tr>
                  ) : (
                    data.content.map((order) => (
                      <tr key={order.id} className="hover:bg-accent/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-foreground">{order.orderNumber}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{order.itemCount} ürün</td>
                        <td className="px-4 py-3">
                          <span className={cn('border text-[10px] tracking-wide px-2 py-0.5', orderStatusClass(order.status))}>
                            {orderStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-light text-foreground">{formatPrice(order.totalAmount)}</td>
                        <td className="px-4 py-3 text-center">
                          <Link to={`/admin/siparisler/${order.id}`} className="text-xs text-brand-earth hover:underline underline-offset-2">Detay</Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {data.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Toplam {data.totalElements} sipariş</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="p-2 border border-border hover:bg-accent transition-colors disabled:opacity-30">
                    <ChevronLeft size={14} strokeWidth={1.5} />
                  </button>
                  <span className="text-xs text-muted-foreground">{page + 1} / {data.totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))} disabled={data.last} className="p-2 border border-border hover:bg-accent transition-colors disabled:opacity-30">
                    <ChevronRight size={14} strokeWidth={1.5} />
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
