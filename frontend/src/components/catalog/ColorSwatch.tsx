import { cn } from '@/lib/utils'
import type { Color } from '@/types/catalog.types'

interface Props {
  color: Color
  selected?: boolean
  onClick?: () => void
  size?: 'sm' | 'md'
}

export function ColorSwatch({ color, selected, onClick, size = 'md' }: Props) {
  const dim = size === 'sm' ? 'w-5 h-5' : 'w-7 h-7'

  return (
    <button
      type="button"
      title={color.name}
      onClick={onClick}
      className={cn(
        dim,
        'rounded-full border-2 transition-all',
        selected
          ? 'border-neutral-900 scale-110 shadow'
          : 'border-neutral-200 hover:border-neutral-400'
      )}
      style={{ backgroundColor: color.hexCode ?? '#ccc' }}
      aria-label={color.name}
      aria-pressed={selected}
    />
  )
}
