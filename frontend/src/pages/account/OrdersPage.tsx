import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { Package, ChevronRight, ChevronLeft } from 'lucide-react'
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
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'SHIPPED':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'DELIVERED':
      return 'bg-green-50 text-green-700 border-green-200'
    case 'CANCELLED':
    case 'PAYMENT_FAILED':
      return 'bg-red-50 text-red-700 border-red-200'
    default:
      return 'bg-accent text-muted-foreground border-border'
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
      <Helmet><title>Siparişlerim — NY Butik</title></Helmet>

      <div>
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-light text-foreground">Siparişlerim</h1>
        </div>

        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse bg-accent border border-border" />
            ))}
          </div>
        )}

        {isError && (
          <div className="border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            Siparişler yüklenirken bir hata oluştu.
          </div>
        )}

        {!isLoading && data && data.content.length === 0 && (
          <div className="border border-dashed border-border p-14 text-center">
            <Package className="mx-auto mb-4 h-10 w-10 text-border" strokeWidth={1} />
            <p className="text-sm font-light text-foreground mb-1">Henüz siparişiniz yok</p>
            <p className="text-xs text-muted-foreground mb-5">İlk siparişinizi vermek için ürünlere göz atın.</p>
            <Link to="/urunler" className="btn-primary btn-sm">Ürünlere Göz At</Link>
          </div>
        )}

        {!isLoading && data && data.content.length > 0 && (
          <>
            <div className="divide-y divide-border border border-border">
              {data.content.map((order) => (
                <Link
                  key={order.id}
                  to={`/hesabim/siparisler/${order.orderNumber}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <Package size={16} className="text-muted-foreground shrink-0" strokeWidth={1.5} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground font-light mt-0.5">
                        {formatDate(order.createdAt)} · {order.itemCount} ürün
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-light text-foreground">{formatPrice(order.totalAmount)}</p>
                      <span className={cn('inline-block border text-[10px] tracking-wide px-2 py-0.5 mt-1', orderStatusClass(order.status))}>
                        {orderStatusLabel(order.status)}
                      </span>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
                  </div>
                </Link>
              ))}
            </div>

            {data.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-2 border border-border hover:bg-accent transition-colors disabled:opacity-30"
                >
                  <ChevronLeft size={14} strokeWidth={1.5} />
                </button>
                <span className="text-xs text-muted-foreground">{page + 1} / {data.totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
                  disabled={data.last}
                  className="p-2 border border-border hover:bg-accent transition-colors disabled:opacity-30"
                >
                  <ChevronRight size={14} strokeWidth={1.5} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
