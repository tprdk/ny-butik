import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { returnApi, type ReturnStatus } from '@/api/return.api'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const TABS: { label: string; value: ReturnStatus | undefined }[] = [
  { label: 'Tümü', value: undefined },
  { label: 'Bekliyor', value: 'REQUESTED' },
  { label: 'Onaylandı', value: 'APPROVED' },
  { label: 'Reddedildi', value: 'REJECTED' },
  { label: 'Teslim Alındı', value: 'RECEIVED' },
  { label: 'İade Edildi', value: 'REFUNDED' },
]

const STATUS_COLORS: Record<ReturnStatus, string> = {
  REQUESTED: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-blue-50 text-blue-700 border-blue-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  RECEIVED: 'bg-purple-50 text-purple-700 border-purple-200',
  REFUNDED: 'bg-green-50 text-green-700 border-green-200',
}

const STATUS_LABELS: Record<ReturnStatus, string> = {
  REQUESTED: 'Bekliyor', APPROVED: 'Onaylandı', REJECTED: 'Reddedildi', RECEIVED: 'Teslim Alındı', REFUNDED: 'İade Edildi',
}

const REASON_LABELS: Record<string, string> = {
  WRONG_SIZE: 'Yanlış Beden', WRONG_PRODUCT: 'Yanlış Ürün', DEFECTIVE: 'Hasarlı/Kusurlu', CHANGED_MIND: 'Fikir Değişikliği', OTHER: 'Diğer',
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

      <div className="space-y-5">
        <h1 className="font-serif text-2xl font-light text-foreground">İade Talepleri</h1>

        <div className="flex gap-1.5 overflow-x-auto border-b border-border pb-4">
          {TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => { setActiveStatus(tab.value); setPage(0) }}
              className={cn(
                'shrink-0 px-3 py-1.5 text-xs tracking-wide transition-colors',
                activeStatus === tab.value
                  ? 'bg-foreground text-background'
                  : 'border border-border text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse bg-accent border border-border" />)}</div>
        ) : (
          <div className="border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-accent/50">
                  {['Sipariş No', 'Sebep', 'Ürün Sayısı', 'Durum', 'Tarih', ''].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-[10px] tracking-[0.12em] uppercase text-muted-foreground font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.content.map((r) => (
                  <tr key={r.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{r.orderNumber}</td>
                    <td className="px-4 py-3 text-sm font-light text-foreground">{REASON_LABELS[r.reason] ?? r.reason}</td>
                    <td className="px-4 py-3 text-sm font-light text-muted-foreground">{r.itemCount} ürün</td>
                    <td className="px-4 py-3">
                      <span className={cn('border text-[10px] tracking-wide px-2 py-0.5', STATUS_COLORS[r.status])}>
                        {STATUS_LABELS[r.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => navigate(`/admin/iadeler/${r.id}`)} className="text-xs text-brand-earth hover:underline underline-offset-2">Detay</button>
                    </td>
                  </tr>
                ))}
                {data?.content.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-sm font-light text-muted-foreground">İade talebi bulunamadı.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{data.totalElements} talep</p>
            <div className="flex items-center gap-3">
              <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="p-2 border border-border hover:bg-accent transition-colors disabled:opacity-30">
                <ChevronLeft size={14} strokeWidth={1.5} />
              </button>
              <span className="text-xs text-muted-foreground">{data.page + 1} / {data.totalPages}</span>
              <button disabled={page >= data.totalPages - 1} onClick={() => setPage((p) => p + 1)} className="p-2 border border-border hover:bg-accent transition-colors disabled:opacity-30">
                <ChevronRight size={14} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
