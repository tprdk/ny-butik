import { NavLink, Outlet, Navigate } from 'react-router-dom'
import { User, ShoppingBag, Heart, MapPin, RotateCcw, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import { useLogout } from '@/hooks/useAuth'

const navItems = [
  { to: '/hesabim', label: 'Profilim', icon: User, end: true },
  { to: '/hesabim/siparisler', label: 'Siparişlerim', icon: ShoppingBag },
  { to: '/hesabim/favoriler', label: 'Favorilerim', icon: Heart },
  { to: '/hesabim/adresler', label: 'Adreslerim', icon: MapPin },
  { to: '/hesabim/iadeler', label: 'İadelerim', icon: RotateCcw },
]

export default function AccountLayout() {
  const { user } = useAuthStore()
  const { mutate: logout } = useLogout()

  if (!user) return <Navigate to="/giris" replace />

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-56 flex-shrink-0">
          {/* Avatar */}
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-brand-cream p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.firstName} {user.lastName}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
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

            <button
              onClick={() => logout()}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Çıkış Yap
            </button>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
