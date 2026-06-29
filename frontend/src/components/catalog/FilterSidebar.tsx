import { useCategories, useColors, useSizes } from '@/hooks/useProducts'
import { ColorSwatch } from './ColorSwatch'
import { cn } from '@/lib/utils'
import type { ProductFilter } from '@/types/catalog.types'

interface Props {
  filter: ProductFilter
  onChange: (patch: Partial<ProductFilter>) => void
}

const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="py-5 border-b border-border last:border-0">
    <h3 className="text-[10px] tracking-[0.14em] uppercase font-medium text-muted-foreground mb-4">
      {title}
    </h3>
    {children}
  </section>
)

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
  const hasActiveFilters = !!(filter.categoryId || filter.colorIds?.length || filter.sizeIds?.length || filter.minPrice || filter.maxPrice)

  return (
    <aside className="w-56 flex-shrink-0">
      {/* Kategori */}
      {categories && categories.length > 0 && (
        <FilterSection title="Kategori">
          <ul className="space-y-0.5">
            <li>
              <button
                onClick={() => onChange({ categoryId: undefined, page: 0 })}
                className={cn(
                  'w-full text-left py-1.5 text-sm transition-colors',
                  !filter.categoryId
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
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
                    'w-full text-left py-1.5 text-sm transition-colors',
                    filter.categoryId === cat.id
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {cat.name}
                </button>
                {cat.children?.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => onChange({ categoryId: child.id, page: 0 })}
                    className={cn(
                      'w-full text-left pl-4 py-1 text-xs transition-colors',
                      filter.categoryId === child.id
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {child.name}
                  </button>
                ))}
              </li>
            ))}
          </ul>
        </FilterSection>
      )}

      {/* Renk */}
      {colors && colors.length > 0 && (
        <FilterSection title="Renk">
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
        </FilterSection>
      )}

      {/* Beden */}
      {sizes && sizes.length > 0 && (
        <FilterSection title="Beden">
          {alphaS.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {alphaS.map((size) => (
                <button
                  key={size.id}
                  onClick={() => onChange({ sizeIds: toggleId(filter.sizeIds, size.id), page: 0 })}
                  className={cn(
                    'min-w-[2rem] h-8 px-2 border text-xs font-light transition-all',
                    filter.sizeIds?.includes(size.id)
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
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
                    'min-w-[2rem] h-8 px-2 border text-xs font-light transition-all',
                    filter.sizeIds?.includes(size.id)
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                  )}
                >
                  {size.name}
                </button>
              ))}
            </div>
          )}
        </FilterSection>
      )}

      {/* Fiyat */}
      <FilterSection title="Fiyat (₺)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            min={0}
            value={filter.minPrice ?? ''}
            onChange={(e) => onChange({ minPrice: e.target.value ? +e.target.value : undefined, page: 0 })}
            className="w-full border border-border bg-white px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
          />
          <span className="text-border text-sm shrink-0">—</span>
          <input
            type="number"
            placeholder="Max"
            min={0}
            value={filter.maxPrice ?? ''}
            onChange={(e) => onChange({ maxPrice: e.target.value ? +e.target.value : undefined, page: 0 })}
            className="w-full border border-border bg-white px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
          />
        </div>
      </FilterSection>

      {/* Temizle */}
      {hasActiveFilters && (
        <button
          onClick={() => onChange({ categoryId: undefined, colorIds: [], sizeIds: [], minPrice: undefined, maxPrice: undefined, page: 0 })}
          className="mt-2 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
        >
          Filtreleri temizle
        </button>
      )}
    </aside>
  )
}
