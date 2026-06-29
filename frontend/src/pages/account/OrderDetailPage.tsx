import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package, Truck, MapPin, Clock, X, ExternalLink, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { orderApi } from '@/api/order.api'
import { formatPrice, formatDate, formatDateTime } from '@/lib/format'
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
    case 'CONFIRMED': case 'PREPARING': return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'SHIPPED': return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'DELIVERED': return 'bg-green-50 text-green-700 border-green-200'
    case 'CANCELLED': case 'PAYMENT_FAILED': return 'bg-red-50 text-red-700 border-red-200'
    default: return 'bg-accent text-muted-foreground border-border'
  }
}

function InfoCard({ title, icon: Icon, children }: { title: string; icon: React.FC<React.SVGProps<SVGSVGElement>>; children: React.ReactNode }) {
  return (
    <div className="border border-border">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
        <h2 className="text-xs tracking-[0.12em] uppercase text-muted-foreground font-medium">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

const CANCELLABLE_STATUSES: OrderStatus[] = ['PENDING_PAYMENT', 'CONFIRMED']

export default function OrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => orderApi.getMyOrder(orderNumber!),
    enabled: !!orderNumber,
  })

  const cancelMutation = useMutation({
    mutationFn: () => orderApi.cancelOrder(orderNumber!),
    onSuccess: (updated) => {
      qc.setQueryData(['order', orderNumber], updated)
      qc.invalidateQueries({ queryKey: ['myOrders'] })
      toast.success('Siparişiniz iptal edildi.')
    },
    onError: () => toast.error('Sipariş iptal edilirken bir hata oluştu.'),
  })

  return (
    <>
      <Helmet>
        <title>{order ? `Sipariş ${order.orderNumber}` : 'Sipariş Detayı'} — NY Butik</title>
      </Helmet>

      <div>
        <button
          onClick={() => navigate('/hesabim/siparisler')}
          className="mb-6 flex items-center gap-1.5 text-xs tracking-wide text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={14} strokeWidth={1.5} /> Siparişlerime Dön
        </button>

        {isLoading && <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 animate-pulse bg-accent border border-border" />)}</div>}

        {isError && (
          <div className="border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            Sipariş bilgileri yüklenirken bir hata oluştu.
          </div>
        )}

        {order && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 border border-border px-5 py-4">
              <div>
                <h1 className="font-serif text-xl font-light text-foreground">{order.orderNumber}</h1>
                <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn('border text-[10px] tracking-wide px-2.5 py-1', orderStatusClass(order.status))}>
                  {orderStatusLabel(order.status)}
                </span>
                {CANCELLABLE_STATUSES.includes(order.status) && (
                  <button
                    onClick={() => window.confirm('Siparişi iptal etmek istediğinize emin misiniz?') && cancelMutation.mutate()}
                    disabled={cancelMutation.isPending}
                    className="flex items-center gap-1.5 border border-destructive/30 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/5 disabled:opacity-50 transition-colors"
                  >
                    <X size={12} /> İptal Et
                  </button>
                )}
              </div>
            </div>

            {/* Items */}
            <InfoCard title="Ürünler" icon={Package as React.FC<React.SVGProps<SVGSVGElement>>}>
              <div className="divide-y divide-border">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName} className="h-16 w-16 object-cover" />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center bg-brand-sand">
                        <Package size={18} className="text-border" strokeWidth={1} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-light text-foreground">{item.productName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {[item.colorName, item.sizeName].filter(Boolean).join(' / ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} adet × {formatPrice(item.salePrice ?? item.unitPrice)}
                      </p>
                    </div>
                    <p className="text-sm font-light text-foreground shrink-0">{formatPrice(item.lineTotal)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Ara toplam</span><span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>İndirim{order.couponCode ? ` (${order.couponCode})` : ''}</span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Kargo</span>
                  <span>{order.shippingAmount === 0 ? <span className="text-green-700">Ücretsiz</span> : formatPrice(order.shippingAmount)}</span>
                </div>
                {order.taxAmount > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>KDV</span><span>{formatPrice(order.taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2 font-medium text-foreground">
                  <span>Toplam</span><span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </InfoCard>

            {/* Kargo */}
            {order.shipment && (
              <InfoCard title="Kargo Takip" icon={Truck as React.FC<React.SVGProps<SVGSVGElement>>}>
                <dl className="space-y-2 text-sm">
                  {[
                    { label: 'Kargo Firması', value: order.shipment.provider },
                    { label: 'Takip No', value: order.shipment.trackingNumber, mono: true },
                    { label: 'Tahmini Teslimat', value: order.shipment.estimatedDelivery ? formatDate(order.shipment.estimatedDelivery) : null },
                    { label: 'Teslim Tarihi', value: order.shipment.deliveredAt ? formatDate(order.shipment.deliveredAt) : null, green: true },
                  ].filter((r) => r.value).map((row) => (
                    <div key={row.label} className="flex justify-between">
                      <dt className="text-muted-foreground">{row.label}</dt>
                      <dd className={cn('font-light', row.mono && 'font-mono text-xs', row.green && 'text-green-700')}>{row.value}</dd>
                    </div>
                  ))}
                  {order.shipment.trackingUrl && (
                    <a href={order.shipment.trackingUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-brand-earth hover:underline mt-1">
                      <ExternalLink size={12} /> Kargo Takibine Git
                    </a>
                  )}
                </dl>
              </InfoCard>
            )}

            {/* Adresler */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { title: 'Teslimat Adresi', name: order.shippingName, phone: order.shippingPhone, addr1: order.shippingAddress1, addr2: order.shippingAddress2, district: order.shippingDistrict, city: order.shippingCity, postal: order.shippingPostal, country: order.shippingCountry },
                { title: 'Fatura Adresi', name: order.billingName, addr1: order.billingAddress1, district: order.billingDistrict, city: order.billingCity },
              ].map((addr) => (
                <div key={addr.title} className="border border-border">
                  <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                    <h2 className="text-xs tracking-[0.12em] uppercase text-muted-foreground font-medium">{addr.title}</h2>
                  </div>
                  <div className="px-5 py-4 text-sm space-y-0.5 text-muted-foreground font-light">
                    <p className="text-foreground">{addr.name}</p>
                    {addr.phone && <p>{addr.phone}</p>}
                    <p>{addr.addr1}</p>
                    {addr.addr2 && <p>{addr.addr2}</p>}
                    <p>{addr.district} / {addr.city}{addr.postal ? ` ${addr.postal}` : ''}</p>
                    {addr.country && <p>{addr.country}</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* Sipariş geçmişi */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="border border-border">
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                  <h2 className="text-xs tracking-[0.12em] uppercase text-muted-foreground font-medium">Sipariş Geçmişi</h2>
                </div>
                <div className="px-5 py-4">
                  <div className="relative space-y-4 pl-5">
                    <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
                    {order.statusHistory.map((entry) => (
                      <div key={entry.id} className="relative">
                        <div className="absolute -left-3.5 top-1 h-2.5 w-2.5 border-2 border-brand-earth bg-background" />
                        <p className="text-sm font-light text-foreground">{orderStatusLabel(entry.status)}</p>
                        {entry.note && <p className="text-xs text-muted-foreground">{entry.note}</p>}
                        <p className="text-[11px] text-muted-foreground/60">{formatDateTime(entry.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {order.notes && (
              <div className="border border-border px-5 py-4">
                <p className="text-xs tracking-[0.12em] uppercase text-muted-foreground mb-2">Sipariş Notu</p>
                <p className="text-sm font-light text-foreground">{order.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
