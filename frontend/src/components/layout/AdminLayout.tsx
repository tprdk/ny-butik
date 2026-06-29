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
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-56 flex-shrink-0 border-r border-border md:flex flex-col bg-background">
        <div className="flex h-14 items-center border-b border-border px-5 gap-2.5">
          <span className="font-serif text-lg font-light tracking-wide">NY Butik</span>
          <span className="bg-foreground text-background px-1.5 py-0.5 text-[9px] font-medium tracking-widest uppercase">
            Admin
          </span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-px">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-foreground text-background font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground font-light'
                )
              }
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 items-center border-b border-border px-6">
          <h1 className="text-sm font-medium text-muted-foreground tracking-wide">Yönetim Paneli</h1>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
