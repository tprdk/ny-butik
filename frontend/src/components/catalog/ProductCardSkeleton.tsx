export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-xl overflow-hidden border border-neutral-100 animate-pulse">
      <div className="aspect-[3/4] bg-neutral-200" />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-3 w-16 bg-neutral-200 rounded" />
        <div className="h-4 w-full bg-neutral-200 rounded" />
        <div className="h-4 w-3/4 bg-neutral-200 rounded" />
        <div className="h-4 w-20 bg-neutral-200 rounded mt-1" />
      </div>
    </div>
  )
}
