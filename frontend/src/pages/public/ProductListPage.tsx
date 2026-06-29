import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react'
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
    <div className="container-site py-10">
      <Helmet>
        <title>Ürünler — NY Butik</title>
        <meta name="description" content="Tüm tesettür giyim ürünleri — NY Butik koleksiyonu." />
      </Helmet>

      {/* Sayfa başlığı */}
      <div className="flex items-end justify-between mb-8 pb-6 border-b border-border">
        <div>
          <h1 className="font-serif text-3xl font-light text-foreground">Ürünler</h1>
          {data && (
            <p className="text-xs text-muted-foreground mt-2 tracking-wide">
              {data.totalElements} ürün
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilter(true)}
            className="lg:hidden flex items-center gap-2 text-xs tracking-wide uppercase text-foreground/60 hover:text-foreground border border-border px-4 py-2.5 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtrele
          </button>
          <select
            value={`${filter.sortBy}:${filter.sortDir}`}
            onChange={(e) => handleSort(e.target.value)}
            className="text-xs border border-border bg-white px-3 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 appearance-none cursor-pointer min-w-[120px]"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-10">
        {/* Filter sidebar — desktop */}
        <div className="hidden lg:block">
          <FilterSidebar filter={filter} onChange={patchFilter} />
        </div>

        {/* Filter drawer — mobile */}
        {showFilter && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setShowFilter(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-80 bg-background shadow-modal overflow-y-auto animate-fade-in">
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <h2 className="text-sm font-medium tracking-wide uppercase text-foreground/70">Filtrele</h2>
                <button onClick={() => setShowFilter(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-6 py-6">
                <FilterSidebar filter={filter} onChange={(patch) => { patchFilter(patch); setShowFilter(false) }} />
              </div>
            </div>
          </div>
        )}

        {/* Ürün ızgarası */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-px bg-border">
            {isLoading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="bg-background"><ProductCardSkeleton /></div>
                ))
              : data?.content.map((product) => (
                  <div key={product.id} className="bg-background"><ProductCard product={product} /></div>
                ))
            }
          </div>

          {!isLoading && data?.content.length === 0 && (
            <div className="py-24 flex flex-col items-center gap-2 text-center">
              <p className="text-muted-foreground font-light">Ürün bulunamadı.</p>
              <p className="text-xs text-muted-foreground/60">Filtrelerinizi değiştirmeyi deneyin.</p>
            </div>
          )}

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12">
              <button
                disabled={filter.page === 0}
                onClick={() => patchFilter({ page: (filter.page ?? 0) - 1 })}
                className="p-2.5 border border-border disabled:opacity-30 hover:bg-accent transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-muted-foreground tracking-wide">
                {(filter.page ?? 0) + 1} / {data.totalPages}
              </span>
              <button
                disabled={data.last}
                onClick={() => patchFilter({ page: (filter.page ?? 0) + 1 })}
                className="p-2.5 border border-border disabled:opacity-30 hover:bg-accent transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
