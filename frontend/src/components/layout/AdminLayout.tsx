import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, RotateCcw, Tag, Users, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/urunler', label: 'Ürünler', icon: Package },
  { to: '/admin/siparisler', label: 'Siparişler', icon: ShoppingCart },
  { to: '/admin/iadeler', label: 'İadeler', icon: RotateCcw },
  { to: '/admin/kuponlar', label: 'Kuponlar', icon: Tag },
  { to: '/admin/musteriler', label: 'Müşteriler', icon: Users },
  { to: '/admin/raporlar', label: 'Raporlar', icon: BarChart2 },
]

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-60 flex-shrink-0 border-r border-border bg-background md:flex flex-col">
        <div className="flex h-16 items-center border-b border-border px-6">
          <span className="font-serif text-xl font-semibold">NY Butik</span>
          <span className="ml-2 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">ADMİN</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center border-b border-border px-6">
          <h1 className="text-lg font-semibold">Yönetim Paneli</h1>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
