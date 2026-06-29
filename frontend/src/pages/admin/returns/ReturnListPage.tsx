import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { returnApi, type ReturnStatus } from '@/api/return.api'
import { formatDate } from '@/lib/format'

const TABS: { label: string; value: ReturnStatus | undefined }[] = [
  { label: 'Tümü', value: undefined },
  { label: 'Bekliyor', value: 'REQUESTED' },
  { label: 'Onaylandı', value: 'APPROVED' },
  { label: 'Reddedildi', value: 'REJECTED' },
  { label: 'Teslim Alındı', value: 'RECEIVED' },
  { label: 'İade Edildi', value: 'REFUNDED' },
]

const STATUS_COLORS: Record<ReturnStatus, string> = {
  REQUESTED: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-red-100 text-red-800',
  RECEIVED: 'bg-purple-100 text-purple-800',
  REFUNDED: 'bg-green-100 text-green-800',
}

const STATUS_LABELS: Record<ReturnStatus, string> = {
  REQUESTED: 'Bekliyor',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
  RECEIVED: 'Teslim Alındı',
  REFUNDED: 'İade Edildi',
}

const REASON_LABELS: Record<string, string> = {
  WRONG_SIZE: 'Yanlış Beden',
  WRONG_PRODUCT: 'Yanlış Ürün',
  DEFECTIVE: 'Hasarlı/Kusurlu',
  CHANGED_MIND: 'Fikir Değişikliği',
  OTHER: 'Diğer',
}

export default function AdminReturnListPage() {
  const navigate = useNavigate()
  const [activeStatus, setActiveStatus] = useState<ReturnStatus | undefined>(undefined)
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'returns', activeStatus, page],
    queryFn: () => returnApi.adminList(activeStatus, page, 20),
  })

  return (
    <>
      <Helmet><title>İadeler — NY Butik Admin</title></Helmet>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">İade Talepleri</h1>

        <div className="flex gap-2 overflow-x-auto border-b pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => { setActiveStatus(tab.value); setPage(0) }}
              className={`shrink-0 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeStatus === tab.value
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr className="text-left text-gray-500">
                  <th className="px-4 py-3">Sipariş No</th>
                  <th className="px-4 py-3">Sebep</th>
                  <th className="px-4 py-3">Ürün Sayısı</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.content.map((r) => (
                  <tr key={r.id} className="text-gray-700 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{r.orderNumber}</td>
                    <td className="px-4 py-3">{REASON_LABELS[r.reason] ?? r.reason}</td>
                    <td className="px-4 py-3">{r.itemCount} ürün</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status]}`}>
                        {STATUS_LABELS[r.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/admin/iadeler/${r.id}`)}
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        Detay
                      </button>
                    </td>
                  </tr>
                ))}
                {data?.content.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      İade talebi bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {data.totalElements} talep, sayfa {data.page + 1} / {data.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="rounded border px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Önceki
              </button>
              <button
                disabled={page >= data.totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="rounded border px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
