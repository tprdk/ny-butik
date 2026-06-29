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
    onError: () => {
      toast.error('Sipariş iptal edilirken bir hata oluştu.')
    },
  })

  const handleCancel = () => {
    if (window.confirm('Siparişi iptal etmek istediğinize emin misiniz?')) {
      cancelMutation.mutate()
    }
  }

  return (
    <>
      <Helmet>
        <title>
          {order ? `Sipariş ${order.orderNumber}` : 'Sipariş Detayı'} — NY Butik
        </title>
      </Helmet>

      <div>
        <button
          onClick={() => navigate('/hesabim/siparisler')}
          className="mb-4 flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft size={16} /> Siparişlerime Dön
        </button>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
          </div>
        )}

        {isError && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
            Sipariş bilgileri yüklenirken bir hata oluştu.
          </div>
        )}

        {order && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-white p-5 shadow-sm">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{order.orderNumber}</h1>
                <p className="mt-1 text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-sm font-medium',
                    orderStatusClass(order.status)
                  )}
                >
                  {orderStatusLabel(order.status)}
                </span>
                {CANCELLABLE_STATUSES.includes(order.status) && (
                  <button
                    onClick={handleCancel}
                    disabled={cancelMutation.isPending}
                    className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    <X size={14} /> İptal Et
                  </button>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                <Package size={18} /> Ürünler
              </h2>
              <div className="divide-y">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
                        <Package size={20} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-500">
                        {[item.colorName, item.sizeName].filter(Boolean).join(' / ')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} adet ×{' '}
                        {formatPrice(item.salePrice ?? item.unitPrice)}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">{formatPrice(item.lineTotal)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-4 space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Ara toplam</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      İndirim{order.couponCode ? ` (${order.couponCode})` : ''}
                    </span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Kargo</span>
                  <span>
                    {order.shippingAmount === 0 ? (
                      <span className="font-medium text-green-600">Ücretsiz</span>
                    ) : (
                      formatPrice(order.shippingAmount)
                    )}
                  </span>
                </div>
                {order.taxAmount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>KDV</span>
                    <span>{formatPrice(order.taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 font-semibold text-gray-900">
                  <span>Toplam</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Shipment */}
            {order.shipment && (
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                  <Truck size={18} /> Kargo Takip
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Kargo Firması</span>
                    <span className="font-medium">{order.shipment.provider}</span>
                  </div>
                  {order.shipment.trackingNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Takip No</span>
                      <span className="font-medium font-mono">{order.shipment.trackingNumber}</span>
                    </div>
                  )}
                  {order.shipment.estimatedDelivery && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tahmini Teslimat</span>
                      <span className="font-medium">
                        {formatDate(order.shipment.estimatedDelivery)}
                      </span>
                    </div>
                  )}
                  {order.shipment.deliveredAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Teslim Tarihi</span>
                      <span className="font-medium text-green-600">
                        {formatDate(order.shipment.deliveredAt)}
                      </span>
                    </div>
                  )}
                  {order.shipment.trackingUrl && (
                    <a
                      href={order.shipment.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 flex items-center gap-1 text-rose-600 hover:text-rose-700"
                    >
                      <ExternalLink size={14} /> Kargo Takibine Git
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Addresses */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <h2 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                  <MapPin size={18} /> Teslimat Adresi
                </h2>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">{order.shippingName}</p>
                  <p>{order.shippingPhone}</p>
                  <p>{order.shippingAddress1}</p>
                  {order.shippingAddress2 && <p>{order.shippingAddress2}</p>}
                  <p>
                    {order.shippingDistrict} / {order.shippingCity} {order.shippingPostal}
                  </p>
                  <p>{order.shippingCountry}</p>
                </div>
              </div>
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <h2 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                  <MapPin size={18} /> Fatura Adresi
                </h2>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">{order.billingName}</p>
                  <p>{order.billingAddress1}</p>
                  <p>
                    {order.billingDistrict} / {order.billingCity}
                  </p>
                </div>
              </div>
            </div>

            {/* Status History */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                  <Clock size={18} /> Sipariş Geçmişi
                </h2>
                <div className="relative space-y-4 pl-5">
                  <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200" />
                  {order.statusHistory.map((entry) => (
                    <div key={entry.id} className="relative flex gap-3">
                      <div className="absolute -left-3 mt-1 h-3 w-3 rounded-full border-2 border-rose-500 bg-white" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {orderStatusLabel(entry.status)}
                        </p>
                        {entry.note && (
                          <p className="text-xs text-gray-500">{entry.note}</p>
                        )}
                        <p className="text-xs text-gray-400">{formatDateTime(entry.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <h2 className="mb-2 font-semibold text-gray-900">Sipariş Notu</h2>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
