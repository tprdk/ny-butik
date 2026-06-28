import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2, Eye, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api/admin.api'
import { formatPrice } from '@/lib/format'

const STATUSES = ['DRAFT', 'ACTIVE', 'PASSIVE'] as const
type Status = typeof STATUSES[number]

export default function AdminProductListPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<Status>('ACTIVE')
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, status, page],
    queryFn: () => adminApi.getProducts({ search: search || undefined, status, page, size: 20 }),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: number; newStatus: string }) =>
      adminApi.updateStatus(id, newStatus),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  })

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    DRAFT: 'bg-amber-100 text-amber-700',
    PASSIVE: 'bg-neutral-100 text-neutral-600',
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">Ürünler</h1>
        <Link to="/admin/urunler/yeni" className="inline-flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-700 transition-colors">
          <Plus className="w-4 h-4" /> Yeni Ürün
        </Link>
      </div>

      {/* Filtreler */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Ürün ara..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            className="w-full pl-9 pr-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
        </div>
        <div className="flex gap-1">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => { setStatus(s); setPage(0) }}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${status === s ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'}`}>
              {s === 'ACTIVE' ? 'Aktif' : s === 'DRAFT' ? 'Taslak' : 'Pasif'}
            </button>
          ))}
        </div>
      </div>

      {/* Tablo */}
      <div className="border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left px-4 py-3 text-neutral-600 font-medium">Görsel</th>
              <th className="text-left px-4 py-3 text-neutral-600 font-medium">Ürün</th>
              <th className="text-left px-4 py-3 text-neutral-600 font-medium">Kategori</th>
              <th className="text-left px-4 py-3 text-neutral-600 font-medium">Fiyat</th>
              <th className="text-left px-4 py-3 text-neutral-600 font-medium">Durum</th>
              <th className="text-right px-4 py-3 text-neutral-600 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-neutral-100 animate-pulse">
                  <td className="px-4 py-3"><div className="w-10 h-10 bg-neutral-200 rounded-lg" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-40 bg-neutral-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-24 bg-neutral-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-16 bg-neutral-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-6 w-14 bg-neutral-200 rounded-full" /></td>
                  <td className="px-4 py-3"></td>
                </tr>
              ))
            ) : data?.content.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-neutral-400">Ürün bulunamadı</td>
              </tr>
            ) : (
              data?.content.map((product) => (
                <tr key={product.id} className="border-t border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                      {product.primaryImageUrl ? (
                        <img src={product.primaryImageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-neutral-200" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900 line-clamp-1">{product.name}</p>
                    <p className="text-xs text-neutral-400">/{product.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{product.category.name}</td>
                  <td className="px-4 py-3 text-neutral-900 font-medium">
                    {product.minPrice != null ? formatPrice(product.minPrice) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[product.status]}`}>
                      {product.status === 'ACTIVE' ? 'Aktif' : product.status === 'DRAFT' ? 'Taslak' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => window.open(`/urunler/${product.slug}`, '_blank')}
                        title="Önizle" className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => navigate(`/admin/urunler/${product.id}/duzenle`)}
                        title="Düzenle" className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => statusMutation.mutate({ id: product.id, newStatus: product.status === 'ACTIVE' ? 'PASSIVE' : 'ACTIVE' })}
                        title={product.status === 'ACTIVE' ? 'Pasife al' : 'Aktife al'}
                        className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
                        {product.status === 'ACTIVE' ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => { if (confirm(`"${product.name}" silinsin mi?`)) deleteMutation.mutate(product.id) }}
                        title="Sil" className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Sayfalama */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <span>{data.totalElements} ürün</span>
          <div className="flex gap-1">
            <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 border border-neutral-200 rounded-lg disabled:opacity-40 hover:bg-neutral-50">
              ‹ Önceki
            </button>
            <button disabled={data.last} onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 border border-neutral-200 rounded-lg disabled:opacity-40 hover:bg-neutral-50">
              Sonraki ›
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
