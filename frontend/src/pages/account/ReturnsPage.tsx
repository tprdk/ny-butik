import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RotateCcw, Plus, X, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { returnApi, type ReturnStatus, type ReturnReason, type CreateReturnPayload } from '@/api/return.api'
import { orderApi } from '@/api/order.api'
import { formatPrice, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

// ─── Label helpers ───────────────────────────────────────────────────────────

function returnStatusLabel(status: ReturnStatus): string {
  const map: Record<ReturnStatus, string> = {
    REQUESTED: 'Talep Edildi',
    APPROVED: 'Onaylandı',
    REJECTED: 'Reddedildi',
    RECEIVED: 'Teslim Alındı',
    REFUNDED: 'İade Edildi',
  }
  return map[status] ?? status
}

function returnStatusClass(status: ReturnStatus): string {
  switch (status) {
    case 'REQUESTED':
      return 'bg-yellow-100 text-yellow-800'
    case 'APPROVED':
      return 'bg-blue-100 text-blue-800'
    case 'REJECTED':
      return 'bg-red-100 text-red-800'
    case 'RECEIVED':
      return 'bg-purple-100 text-purple-800'
    case 'REFUNDED':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function returnReasonLabel(reason: ReturnReason): string {
  const map: Record<ReturnReason, string> = {
    WRONG_SIZE: 'Yanlış Beden',
    WRONG_PRODUCT: 'Yanlış Ürün',
    DEFECTIVE: 'Hasarlı/Kusurlu',
    CHANGED_MIND: 'Fikir Değişikliği',
    OTHER: 'Diğer',
  }
  return map[reason] ?? reason
}

const RETURN_REASONS: ReturnReason[] = [
  'WRONG_SIZE',
  'WRONG_PRODUCT',
  'DEFECTIVE',
  'CHANGED_MIND',
  'OTHER',
]

// ─── Detail accordion ────────────────────────────────────────────────────────

function ReturnDetailAccordion({ id }: { id: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ['myReturn', id],
    queryFn: () => returnApi.getMyReturn(id),
  })

  if (isLoading) {
    return (
      <div className="px-4 pb-4 text-sm text-gray-500">Yükleniyor...</div>
    )
  }

  if (!data) return null

  return (
    <div className="border-t border-gray-100 px-4 pb-4 pt-3 text-sm text-gray-700 space-y-2">
      {data.items.length > 0 && (
        <div>
          <p className="font-medium text-gray-800 mb-1">Ürünler</p>
          <ul className="space-y-1">
            {data.items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>{item.productName} <span className="text-gray-400">({item.sku})</span></span>
                <span className="text-gray-600">{item.quantity} adet</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {data.description && (
        <p><span className="font-medium">Açıklama: </span>{data.description}</p>
      )}
      {data.adminNote && (
        <p className="rounded bg-blue-50 p-2 text-blue-800">
          <span className="font-medium">Yönetici notu: </span>{data.adminNote}
        </p>
      )}
      {data.returnTracking && (
        <p><span className="font-medium">Kargo takip: </span>{data.returnTracking}</p>
      )}
      {data.refundAmount !== null && (
        <p><span className="font-medium">İade tutarı: </span>{formatPrice(data.refundAmount)}</p>
      )}
    </div>
  )
}

// ─── New return form ─────────────────────────────────────────────────────────

function NewReturnForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['myOrders-for-return'],
    queryFn: () => orderApi.getMyOrders(0, 50),
  })

  const deliveredOrders = ordersData?.content.filter((o) => o.status === 'DELIVERED') ?? []

  const [selectedOrderId, setSelectedOrderId] = useState<number | ''>('')
  const [reason, setReason] = useState<ReturnReason>('WRONG_SIZE')
  const [description, setDescription] = useState('')

  const mutation = useMutation({
    mutationFn: (payload: CreateReturnPayload) => returnApi.create(payload),
    onSuccess: () => {
      toast.success('İade talebiniz oluşturuldu.')
      queryClient.invalidateQueries({ queryKey: ['myReturns'] })
      onClose()
    },
    onError: () => {
      toast.error('İade talebi oluşturulurken bir hata oluştu.')
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedOrderId) {
      toast.error('Lütfen bir sipariş seçin.')
      return
    }
    mutation.mutate({
      orderId: Number(selectedOrderId),
      reason,
      description: description.trim() || undefined,
      items: [],
    })
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 mt-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Yeni İade Talebi</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-200 transition-colors"
          aria-label="Formu kapat"
        >
          <X size={18} />
        </button>
      </div>

      {ordersLoading && (
        <p className="text-sm text-gray-500">Siparişler yükleniyor...</p>
      )}

      {!ordersLoading && deliveredOrders.length === 0 && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
          İade edebileceğiniz teslim edilmiş sipariş bulunmuyor.
        </div>
      )}

      {!ordersLoading && deliveredOrders.length > 0 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Sipariş seçin
            </label>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value ? Number(e.target.value) : '')}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              <option value="">— Sipariş seçin —</option>
              {deliveredOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} · {formatDate(o.createdAt)} · {formatPrice(o.totalAmount)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              İade sebebi
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ReturnReason)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              {RETURN_REASONS.map((r) => (
                <option key={r} value={r}>{returnReasonLabel(r)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Açıklama <span className="text-gray-400 font-normal">(isteğe bağlı)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="İade sebebinizi detaylı açıklayabilirsiniz..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-lg bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60 transition-colors"
            >
              {mutation.isPending ? 'Gönderiliyor...' : 'Talebi Gönder'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ReturnsPage() {
  const [page, setPage] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['myReturns', page],
    queryFn: () => returnApi.getMyReturns(page, 10),
  })

  function toggleExpand(id: number) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <>
      <Helmet>
        <title>İadelerim — NY Butik</title>
      </Helmet>

      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">İadelerim</h1>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition-colors"
          >
            <Plus size={16} />
            Yeni İade Talebi
          </button>
        </div>

        {showForm && <NewReturnForm onClose={() => setShowForm(false)} />}

        <div className="mt-6">
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
            </div>
          )}

          {isError && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              İadeler yüklenirken bir hata oluştu.
            </div>
          )}

          {!isLoading && data && data.content.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
              <RotateCcw className="mx-auto mb-3 h-12 w-12 text-gray-400" />
              <p className="font-medium text-gray-700">Henüz iade talebiniz yok</p>
              <p className="mt-1 text-sm text-gray-500">
                Teslim edilen siparişleriniz için iade talebi oluşturabilirsiniz.
              </p>
            </div>
          )}

          {!isLoading && data && data.content.length > 0 && (
            <>
              <div className="space-y-3">
                {data.content.map((ret) => (
                  <div
                    key={ret.id}
                    className="rounded-xl border border-gray-200 bg-white overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleExpand(ret.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 shrink-0">
                          <RotateCcw size={20} className="text-gray-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            Sipariş {ret.orderNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(ret.createdAt)} · {returnReasonLabel(ret.reason)} · {ret.itemCount} ürün
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          {ret.refundAmount !== null && (
                            <p className="text-sm font-semibold text-gray-900">
                              {formatPrice(ret.refundAmount)}
                            </p>
                          )}
                          <span
                            className={cn(
                              'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                              returnStatusClass(ret.status)
                            )}
                          >
                            {returnStatusLabel(ret.status)}
                          </span>
                        </div>
                        {expandedId === ret.id ? (
                          <ChevronUp size={18} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={18} className="text-gray-400" />
                        )}
                      </div>
                    </button>

                    {expandedId === ret.id && <ReturnDetailAccordion id={ret.id} />}
                  </div>
                ))}
              </div>

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
      </div>
    </>
  )
}
