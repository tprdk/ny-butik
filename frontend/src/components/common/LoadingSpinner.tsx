import { cn } from '@/lib/utils'

interface Props {
  fullScreen?: boolean
  className?: string
}

export default function LoadingSpinner({ fullScreen, className }: Props) {
  return (
    <div className={cn(
      'flex items-center justify-center',
      fullScreen && 'min-h-screen',
      className
    )}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}
