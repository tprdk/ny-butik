import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { customerApi } from '@/api/customer.api'
import { formatPrice, formatDate } from '@/lib/format'

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'customers', id],
    queryFn: () => customerApi.get(Number(id)),
    enabled: !!id,
  })

  const toggleMutation = useMutation({
    mutationFn: () => customerApi.toggleActive(Number(id)),
    onSuccess: (updated) => {
      toast.success(updated.isActive ? 'Müşteri aktif edildi' : 'Müşteri pasife alındı')
      qc.invalidateQueries({ queryKey: ['admin', 'customers'] })
    },
    onError: () => toast.error('İşlem başarısız'),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    )
  }

  if (!data) return null

  return (
    <>
      <Helmet><title>{data.firstName} {data.lastName} — NY Butik Admin</title></Helmet>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/musteriler')} className="text-sm text-gray-500 hover:text-gray-700">
            ← Geri
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {data.firstName} {data.lastName}
          </h1>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              data.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
            }`}
          >
            {data.isActive ? 'Aktif' : 'Pasif'}
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-500">E-posta</p>
            <p className="mt-1 font-medium">{data.email}</p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-500">Üyelik Tarihi</p>
            <p className="mt-1 font-medium">{formatDate(data.createdAt)}</p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-500">Rol</p>
            <p className="mt-1 font-medium">{data.role}</p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-500">Toplam Sipariş</p>
            <p className="mt-1 text-2xl font-bold">{data.orderCount}</p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-500">Toplam Harcama</p>
            <p className="mt-1 text-2xl font-bold text-green-700">{formatPrice(data.totalSpent)}</p>
          </div>
        </div>

        <div>
          <button
            onClick={() => toggleMutation.mutate()}
            disabled={toggleMutation.isPending}
            className={`rounded-lg px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50 ${
              data.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {toggleMutation.isPending
              ? 'İşleniyor...'
              : data.isActive
              ? 'Müşteriyi Pasife Al'
              : 'Müşteriyi Aktif Et'}
          </button>
        </div>
      </div>
    </>
  )
}
