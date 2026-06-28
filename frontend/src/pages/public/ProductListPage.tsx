import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { ProductCard } from '@/components/catalog/ProductCard'
import { ProductCardSkeleton } from '@/components/catalog/ProductCardSkeleton'
import { FilterSidebar } from '@/components/catalog/FilterSidebar'
import type { ProductFilter } from '@/types/catalog.types'

const SORT_OPTIONS = [
  { label: 'En Yeni', value: 'createdAt:desc' },
  { label: 'En Eski', value: 'createdAt:asc' },
]

export default function ProductListPage() {
  const [searchParams] = useSearchParams()
  const [showFilter, setShowFilter] = useState(false)
  const [filter, setFilter] = useState<ProductFilter>({
    categoryId: searchParams.get('kategori') ? Number(searchParams.get('kategori')) : undefined,
    search: searchParams.get('ara') ?? undefined,
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortDir: 'desc',
  })
  const { data, isLoading } = useProducts(filter)
  const patchFilter = (patch: Partial<ProductFilter>) => setFilter((prev) => ({ ...prev, ...patch }))

  const handleSort = (val: string) => {
    const [by, dir] = val.split(':')
    patchFilter({ sortBy: by, sortDir: dir as 'asc' | 'desc', page: 0 })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet><title>Ürünler — NY Butik</title></Helmet>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Ürünler</h1>
          {data && <p className="text-sm text-neutral-500 mt-1">{data.totalElements} ürün bulundu</p>}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilter((v) => !v)}
            className="flex items-center gap-1.5 text-sm border border-neutral-200 px-3 py-2 rounded-lg hover:bg-neutral-50 lg:hidden"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filtrele
          </button>
          <select
            value={`${filter.sortBy}:${filter.sortDir}`}
            onChange={(e) => handleSort(e.target.value)}
            className="text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-400"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="hidden lg:block">
          <FilterSidebar filter={filter} onChange={patchFilter} />
        </div>

        {showFilter && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilter(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-white p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">Filtrele</h2>
                <button onClick={() => setShowFilter(false)} className="text-neutral-500">✕</button>
              </div>
              <FilterSidebar filter={filter} onChange={(patch) => { patchFilter(patch); setShowFilter(false) }} />
            </div>
          </div>
        )}

        <div className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {isLoading
              ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : data?.content.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button disabled={filter.page === 0} onClick={() => patchFilter({ page: (filter.page ?? 0) - 1 })} className="p-2 rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-neutral-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-neutral-600">{(filter.page ?? 0) + 1} / {data.totalPages}</span>
              <button disabled={data.last} onClick={() => patchFilter({ page: (filter.page ?? 0) + 1 })} className="p-2 rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-neutral-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {!isLoading && data?.content.length === 0 && (
            <div className="text-center py-20 text-neutral-400">
              <p className="text-lg">Ürün bulunamadı</p>
              <p className="text-sm mt-1">Filtrelerinizi değiştirmeyi deneyin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
