import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { customerApi } from '@/api/customer.api'
import { formatDate } from '@/lib/format'

export default function CustomerListPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'customers', page],
    queryFn: () => customerApi.list(page, 20),
  })

  const toggleMutation = useMutation({
    mutationFn: (id: number) => customerApi.toggleActive(id),
    onSuccess: (updated) => {
      toast.success(updated.isActive ? 'Müşteri aktif edildi' : 'Müşteri pasife alındı')
      qc.invalidateQueries({ queryKey: ['admin', 'customers'] })
    },
    onError: () => toast.error('İşlem başarısız'),
  })

  return (
    <>
      <Helmet><title>Müşteriler — NY Butik Admin</title></Helmet>

      <div className="space-y-5">
        <h1 className="font-serif text-2xl font-light text-foreground">Müşteriler</h1>

        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-12 animate-pulse bg-accent border border-border" />)}</div>
        ) : (
          <div className="border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-accent/50">
                  {['Ad Soyad', 'E-posta', 'Üyelik Tarihi', 'Durum', ''].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-[10px] tracking-[0.12em] uppercase text-muted-foreground font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.content.map((c) => (
                  <tr key={c.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-light text-foreground">{c.firstName} {c.lastName}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.email}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`border text-[10px] tracking-wide px-2 py-0.5 ${c.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {c.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => navigate(`/admin/musteriler/${c.id}`)} className="text-xs text-brand-earth hover:underline underline-offset-2">Detay</button>
                        <button
                          onClick={() => toggleMutation.mutate(c.id)}
                          disabled={toggleMutation.isPending}
                          className="text-xs text-muted-foreground hover:text-foreground hover:underline underline-offset-2 disabled:opacity-40 transition-colors"
                        >
                          {c.isActive ? 'Pasife Al' : 'Aktif Et'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data?.content.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-sm font-light text-muted-foreground">Müşteri bulunamadı.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{data.totalElements} müşteri</p>
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
