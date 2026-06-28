import { useCategories, useColors, useSizes } from '@/hooks/useProducts'
import { ColorSwatch } from './ColorSwatch'
import { cn } from '@/lib/utils'
import type { ProductFilter } from '@/types/catalog.types'

interface Props {
  filter: ProductFilter
  onChange: (patch: Partial<ProductFilter>) => void
}

export function FilterSidebar({ filter, onChange }: Props) {
  const { data: categories } = useCategories()
  const { data: colors } = useColors()
  const { data: sizes } = useSizes()

  const toggleId = (list: number[] | undefined, id: number): number[] => {
    const arr = list ?? []
    return arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]
  }

  const alphaS = sizes?.filter((s) => s.sizeGroup === 'ALPHA') ?? []
  const numericS = sizes?.filter((s) => s.sizeGroup === 'NUMERIC') ?? []

  return (
    <aside className="flex flex-col gap-6 w-60 flex-shrink-0">
      {/* Kategori */}
      {categories && categories.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-neutral-700 mb-2">Kategori</h3>
          <ul className="flex flex-col gap-0.5">
            <li>
              <button
                onClick={() => onChange({ categoryId: undefined, page: 0 })}
                className={cn(
                  'text-sm w-full text-left px-2 py-1 rounded-lg hover:bg-neutral-100 transition-colors',
                  !filter.categoryId ? 'font-semibold text-neutral-900' : 'text-neutral-600'
                )}
              >
                Tümü
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => onChange({ categoryId: cat.id, page: 0 })}
                  className={cn(
                    'text-sm w-full text-left px-2 py-1 rounded-lg hover:bg-neutral-100 transition-colors',
                    filter.categoryId === cat.id ? 'font-semibold text-neutral-900' : 'text-neutral-600'
                  )}
                >
                  {cat.name}
                </button>
                {cat.children?.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => onChange({ categoryId: child.id, page: 0 })}
                    className={cn(
                      'text-sm w-full text-left pl-5 py-1 rounded-lg hover:bg-neutral-100 transition-colors',
                      filter.categoryId === child.id ? 'font-semibold text-neutral-900' : 'text-neutral-500'
                    )}
                  >
                    {child.name}
                  </button>
                ))}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Renk */}
      {colors && colors.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-neutral-700 mb-2">Renk</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <ColorSwatch
                key={color.id}
                color={color}
                selected={filter.colorIds?.includes(color.id)}
                onClick={() => onChange({ colorIds: toggleId(filter.colorIds, color.id), page: 0 })}
                size="sm"
              />
            ))}
          </div>
        </section>
      )}

      {/* Beden */}
      {sizes && sizes.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-neutral-700 mb-2">Beden</h3>
          {alphaS.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {alphaS.map((size) => (
                <button
                  key={size.id}
                  onClick={() => onChange({ sizeIds: toggleId(filter.sizeIds, size.id), page: 0 })}
                  className={cn(
                    'min-w-[2.2rem] h-8 px-2 rounded-lg border text-xs font-medium transition-all',
                    filter.sizeIds?.includes(size.id)
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
                  )}
                >
                  {size.name}
                </button>
              ))}
            </div>
          )}
          {numericS.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {numericS.map((size) => (
                <button
                  key={size.id}
                  onClick={() => onChange({ sizeIds: toggleId(filter.sizeIds, size.id), page: 0 })}
                  className={cn(
                    'min-w-[2.2rem] h-8 px-2 rounded-lg border text-xs font-medium transition-all',
                    filter.sizeIds?.includes(size.id)
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
                  )}
                >
                  {size.name}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Fiyat */}
      <section>
        <h3 className="text-sm font-semibold text-neutral-700 mb-2">Fiyat (₺)</h3>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            min={0}
            value={filter.minPrice ?? ''}
            onChange={(e) => onChange({ minPrice: e.target.value ? +e.target.value : undefined, page: 0 })}
            className="w-full border border-neutral-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
          <span className="text-neutral-400 text-sm">—</span>
          <input
            type="number"
            placeholder="Max"
            min={0}
            value={filter.maxPrice ?? ''}
            onChange={(e) => onChange({ maxPrice: e.target.value ? +e.target.value : undefined, page: 0 })}
            className="w-full border border-neutral-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
        </div>
      </section>

      {/* Temizle */}
      {(filter.categoryId || filter.colorIds?.length || filter.sizeIds?.length || filter.minPrice || filter.maxPrice) && (
        <button
          onClick={() => onChange({ categoryId: undefined, colorIds: [], sizeIds: [], minPrice: undefined, maxPrice: undefined, page: 0 })}
          className="text-sm text-rose-500 hover:text-rose-700 text-left"
        >
          Filtreleri temizle
        </button>
      )}
    </aside>
  )
}
