interface StatCardProps {
  title: string
  value: string | number
  sub?: string
  color?: 'blue' | 'green' | 'orange' | 'red'
}

const colorMap = {
  blue: 'border-blue-100 text-blue-700',
  green: 'border-green-100 text-green-700',
  orange: 'border-amber-100 text-amber-700',
  red: 'border-red-100 text-red-700',
}

export default function StatCard({ title, value, sub, color = 'blue' }: StatCardProps) {
  return (
    <div className={`border bg-background p-5 ${colorMap[color]}`}>
      <p className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-2">{title}</p>
      <p className="text-2xl font-light text-foreground">{value}</p>
      {sub && <p className="mt-1.5 text-xs text-muted-foreground font-light">{sub}</p>}
    </div>
  )
}
