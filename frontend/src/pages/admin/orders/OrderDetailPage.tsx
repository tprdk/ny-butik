import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package, Truck, MapPin, Clock, ChevronLeft, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { orderApi } from '@/api/order.api'
import { formatPrice, formatDate, formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types/order.types'

const UPDATABLE_STATUSES: OrderStatus[] = [
  'CONFIRMED',
  'PREPARING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
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

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('CONFIRMED')
  const [statusNote, setStatusNote] = useState('')

  const orderId = id ? parseInt(id, 10) : NaN

  const { data: order, isLoading, isError } = useQuery<Order>({
    queryKey: ['adminOrder', orderId],
    queryFn: () => orderApi.adminGetOrder(orderId),
    enabled: !isNaN(orderId),
  })

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status)
    }
  }, [order])

  const updateStatus = useMutation({
    mutationFn: ({ status, note }: { status: string; note?: string }) =>
      orderApi.adminUpdateStatus(orderId, status, note),
    onSuccess: (updated) => {
      qc.setQueryData(['adminOrder', orderId], updated)
      qc.invalidateQueries({ queryKey: ['adminOrders'] })
      setStatusNote('')
      toast.success('Sipariş durumu güncellendi.')
    },
    onError: () => {
      toast.error('Durum güncellenirken bir hata oluştu.')
    },
  })

  const handleStatusUpdate = () => {
    if (!selectedStatus) return
    updateStatus.mutate({
      status: selectedStatus,
      note: statusNote.trim() || undefined,
    })
  }

  return (
    <>
      <Helmet>
        <title>
          {order ? `Sipariş ${order.orderNumber}` : 'Sipariş Detayı'} — NY Butik Admin
        </title>
      </Helmet>

      <div>
        <button
          onClick={() => navigate('/admin/siparisler')}
          className="mb-4 flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft size={16} /> Sipariş Listesine Dön
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
                <p className="mt-1 text-sm text-gray-500">
                  Sipariş ID: #{order.id} · {formatDateTime(order.createdAt)}
                </p>
              </div>
              <span
                className={cn(
                  'rounded-full px-3 py-1 text-sm font-medium',
                  orderStatusClass(order.status)
                )}
              >
                {orderStatusLabel(order.status)}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {/* Left: items + address */}
              <div className="space-y-5 lg:col-span-2">
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
                          <p className="text-xs text-gray-500 font-mono">{item.sku}</p>
                          <p className="text-sm text-gray-500">
                            {[item.colorName, item.sizeName].filter(Boolean).join(' / ')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} adet × {formatPrice(item.salePrice ?? item.unitPrice)}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900">{formatPrice(item.lineTotal)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2 border-t pt-4 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Ara toplam</span>
                      <span>{formatPrice(order.subtotal)}</span>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>İndirim{order.couponCode ? ` (${order.couponCode})` : ''}</span>
                        <span>-{formatPrice(order.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>Kargo</span>
                      <span>{order.shippingAmount === 0 ? 'Ücretsiz' : formatPrice(order.shippingAmount)}</span>
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

                {/* Addresses */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-white p-5 shadow-sm">
                    <h2 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                      <MapPin size={16} /> Teslimat Adresi
                    </h2>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="font-medium text-gray-900">{order.shippingName}</p>
                      <p>{order.shippingPhone}</p>
                      <p>{order.shippingAddress1}</p>
                      {order.shippingAddress2 && <p>{order.shippingAddress2}</p>}
                      <p>
                        {order.shippingDistrict} / {order.shippingCity} {order.shippingPostal}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-white p-5 shadow-sm">
                    <h2 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                      <MapPin size={16} /> Fatura Adresi
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

                {/* Shipment */}
                {order.shipment && (
                  <div className="rounded-xl bg-white p-5 shadow-sm">
                    <h2 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                      <Truck size={18} /> Kargo Bilgisi
                    </h2>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Firma</span>
                        <span>{order.shipment.provider}</span>
                      </div>
                      {order.shipment.trackingNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Takip No</span>
                          <span className="font-mono">{order.shipment.trackingNumber}</span>
                        </div>
                      )}
                      {order.shipment.estimatedDelivery && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Tahmini Teslimat</span>
                          <span>{formatDate(order.shipment.estimatedDelivery)}</span>
                        </div>
                      )}
                      {order.shipment.trackingUrl && (
                        <a
                          href={order.shipment.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-rose-600 hover:text-rose-700"
                        >
                          <ExternalLink size={13} /> Kargo Takibi
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: status update + history */}
              <div className="space-y-5">
                {/* Status update */}
                <div className="rounded-xl bg-white p-5 shadow-sm">
                  <h2 className="mb-4 font-semibold text-gray-900">Durum Güncelle</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Yeni Durum
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                      >
                        {UPDATABLE_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {orderStatusLabel(s)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Not (opsiyonel)
                      </label>
                      <textarea
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        rows={3}
                        placeholder="Durum değişikliği ile ilgili not..."
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                    </div>
                    <button
                      onClick={handleStatusUpdate}
                      disabled={updateStatus.isPending || selectedStatus === order.status}
                      className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                      {updateStatus.isPending ? 'Güncelleniyor...' : 'Güncelle'}
                    </button>
                    {selectedStatus === order.status && (
                      <p className="text-xs text-gray-400 text-center">
                        Mevcut durum ile aynı, farklı bir durum seçin.
                      </p>
                    )}
                  </div>
                </div>

                {/* Status History */}
                {order.statusHistory && order.statusHistory.length > 0 && (
                  <div className="rounded-xl bg-white p-5 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                      <Clock size={16} /> Durum Geçmişi
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
                            {entry.changedBy && (
                              <p className="text-xs text-gray-400">{entry.changedBy}</p>
                            )}
                            <p className="text-xs text-gray-400">
                              {formatDateTime(entry.createdAt)}
                            </p>
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
            </div>
          </div>
        )}
      </div>
    </>
  )
}
