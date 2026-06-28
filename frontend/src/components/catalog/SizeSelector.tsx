import { cn } from '@/lib/utils'
import type { Size } from '@/types/catalog.types'

interface Props {
  sizes: Size[]
  selectedId?: number
  disabledIds?: number[]
  onSelect: (size: Size) => void
}

export function SizeSelector({ sizes, selectedId, disabledIds = [], onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((size) => {
        const disabled = disabledIds.includes(size.id)
        return (
          <button
            key={size.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(size)}
            className={cn(
              'min-w-[2.5rem] h-10 px-3 rounded-lg border text-sm font-medium transition-all',
              selectedId === size.id
                ? 'border-neutral-900 bg-neutral-900 text-white'
                : disabled
                ? 'border-neutral-100 bg-neutral-50 text-neutral-300 cursor-not-allowed line-through'
                : 'border-neutral-200 hover:border-neutral-400 text-neutral-700'
            )}
          >
            {size.name}
          </button>
        )
      })}
    </div>
  )
}
