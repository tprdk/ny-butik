import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { returnApi, type ReturnStatus } from '@/api/return.api'
import { formatDateTime } from '@/lib/format'

const STATUS_OPTIONS: { value: ReturnStatus; label: string }[] = [
  { value: 'REQUESTED', label: 'Bekliyor' },
  { value: 'APPROVED', label: 'Onaylandı' },
  { value: 'REJECTED', label: 'Reddedildi' },
  { value: 'RECEIVED', label: 'Teslim Alındı' },
  { value: 'REFUNDED', label: 'İade Edildi' },
]

const REASON_LABELS: Record<string, string> = {
  WRONG_SIZE: 'Yanlış Beden',
  WRONG_PRODUCT: 'Yanlış Ürün',
  DEFECTIVE: 'Hasarlı/Kusurlu',
  CHANGED_MIND: 'Fikir Değişikliği',
  OTHER: 'Diğer',
}

export default function AdminReturnDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'returns', id],
    queryFn: () => returnApi.adminGet(Number(id)),
    enabled: !!id,
  })

  const [status, setStatus] = useState<ReturnStatus>('REQUESTED')
  const [adminNote, setAdminNote] = useState('')
  const [returnTracking, setReturnTracking] = useState('')
  const [refundAmount, setRefundAmount] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      returnApi.adminUpdate(Number(id), {
        status,
        adminNote: adminNote || undefined,
        returnTracking: returnTracking || undefined,
        refundAmount: refundAmount ? Number(refundAmount) : undefined,
      }),
    onSuccess: () => {
      toast.success('İade talebi güncellendi')
      qc.invalidateQueries({ queryKey: ['admin', 'returns'] })
    },
    onError: () => toast.error('Güncelleme başarısız'),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    )
  }

  if (!data) return null

  return (
    <>
      <Helmet><title>İade #{data.id} — NY Butik Admin</title></Helmet>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/iadeler')} className="text-sm text-gray-500 hover:text-gray-700">
            ← Geri
          </button>
          <h1 className="text-2xl font-bold text-gray-900">İade Talebi #{data.id}</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded-lg border bg-white p-4">
              <h2 className="mb-3 font-semibold text-gray-800">Talep Bilgileri</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Sipariş No</dt>
                  <dd className="font-mono font-medium">{data.orderNumber}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Sebep</dt>
                  <dd>{REASON_LABELS[data.reason] ?? data.reason}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Tarih</dt>
                  <dd>{formatDateTime(data.createdAt)}</dd>
                </div>
                {data.description && (
                  <div>
                    <dt className="text-gray-500">Açıklama</dt>
                    <dd className="mt-1 rounded bg-gray-50 p-2 text-gray-700">{data.description}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="rounded-lg border bg-white p-4">
              <h2 className="mb-3 font-semibold text-gray-800">İade Edilen Ürünler</h2>
              <div className="space-y-2">
                {data.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-gray-400">SKU: {item.sku}</p>
                    </div>
                    <span className="font-semibold">{item.quantity} adet</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-4">
            <h2 className="mb-4 font-semibold text-gray-800">Durum Güncelle</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-600">Durum</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ReturnStatus)}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  defaultValue={data.status}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-600">Admin Notu</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={data.adminNote ?? 'Not ekle...'}
                  rows={3}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-600">Kargo Takip Numarası</label>
                <input
                  type="text"
                  value={returnTracking}
                  onChange={(e) => setReturnTracking(e.target.value)}
                  placeholder={data.returnTracking ?? 'Takip no...'}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-600">İade Tutarı (₺)</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder={data.refundAmount != null ? String(data.refundAmount) : '0.00'}
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
              >
                {mutation.isPending ? 'Kaydediliyor...' : 'Güncelle'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
