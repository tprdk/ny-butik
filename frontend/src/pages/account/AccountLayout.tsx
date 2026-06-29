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
    <div className="container-site py-10">
      <div className="flex flex-col gap-10 md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-52 flex-shrink-0">
          {/* Avatar */}
          <div className="mb-6 flex items-center gap-3 bg-accent px-4 py-4 border border-border">
            <div className="flex h-9 w-9 items-center justify-center bg-foreground text-background text-xs font-medium shrink-0">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-light text-foreground">{user.firstName} {user.lastName}</p>
              <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <nav className="space-y-px">
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

            <button
              onClick={() => logout()}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-light text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
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
