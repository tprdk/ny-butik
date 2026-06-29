export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-white animate-pulse">
      <div className="aspect-[3/4] bg-brand-sand" />
      <div className="pt-3 pb-4 px-0.5 flex flex-col gap-2">
        <div className="h-2.5 w-14 bg-border rounded-sm" />
        <div className="h-3.5 w-full bg-border rounded-sm" />
        <div className="h-3.5 w-2/3 bg-border rounded-sm" />
        <div className="h-3.5 w-20 bg-border rounded-sm mt-1" />
      </div>
    </div>
  )
}
