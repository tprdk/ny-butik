import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ProductImage } from '@/types/catalog.types'

interface Props {
  images: ProductImage[]
  productName: string
}

export function ImageGallery({ images, productName }: Props) {
  const sorted = [...images].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1
    if (!a.isPrimary && b.isPrimary) return 1
    return a.displayOrder - b.displayOrder
  })

  const [activeIndex, setActiveIndex] = useState(0)
  const active = sorted[activeIndex]

  if (!active) {
    return (
      <div className="aspect-square bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-300">
        <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-50">
        <img
          src={active.url}
          alt={active.altText ?? productName}
          className="w-full h-full object-cover"
        />
      </div>

      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all',
                i === activeIndex ? 'border-neutral-900' : 'border-transparent hover:border-neutral-300'
              )}
            >
              <img src={img.url} alt={img.altText ?? productName} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
