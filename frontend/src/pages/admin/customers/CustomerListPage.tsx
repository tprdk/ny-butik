import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
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

      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Müşteriler</h1>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr className="text-left text-gray-500">
                  <th className="px-4 py-3">Ad Soyad</th>
                  <th className="px-4 py-3">E-posta</th>
                  <th className="px-4 py-3">Üyelik Tarihi</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.content.map((c) => (
                  <tr key={c.id} className="text-gray-700 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      {c.firstName} {c.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{c.email}</td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          c.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {c.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate(`/admin/musteriler/${c.id}`)}
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          Detay
                        </button>
                        <button
                          onClick={() => toggleMutation.mutate(c.id)}
                          disabled={toggleMutation.isPending}
                          className="text-xs font-medium text-gray-500 hover:underline disabled:opacity-40"
                        >
                          {c.isActive ? 'Pasife Al' : 'Aktif Et'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data?.content.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      Müşteri bulunamadı.
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
              {data.totalElements} müşteri, sayfa {data.page + 1} / {data.totalPages}
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
