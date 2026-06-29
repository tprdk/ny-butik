import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingBag, Heart, User, Search, X, Menu } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'
import { useCart } from '@/hooks/useCart'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Yeni Gelenler', to: '/urunler?sort=newest' },
  { label: 'Kıyafet', to: '/kategori/kiyafet' },
  { label: 'Aksesuarlar', to: '/kategori/aksesuarlar' },
  { label: 'Tüm Ürünler', to: '/urunler' },
]

export default function Header() {
  const { isAuthenticated } = useAuthStore()
  const { open } = useCartStore()
  const { itemCount } = useCart()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-brand-dark text-white/80 text-center py-2.5 text-[11px] tracking-[0.12em] uppercase font-light">
        Ücretsiz Kargo — 500 ₺ ve Üzeri Siparişlerde
      </div>

      <header
        className={cn(
          'sticky top-0 z-40 bg-background transition-shadow duration-300',
          scrolled ? 'shadow-subtle border-b border-border' : 'border-b border-border/50'
        )}
      >
        <div className="container-site flex h-16 items-center justify-between">
          {/* Mobile: hamburger */}
          <button
            className="md:hidden text-foreground/70 hover:text-foreground transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menü"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo */}
          <Link
            to="/"
            className="font-serif text-[1.65rem] font-light tracking-[0.04em] text-foreground leading-none"
          >
            NY Butik
          </Link>

          {/* Nav — desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'text-[13px] font-light tracking-wide transition-colors duration-150',
                  location.pathname === link.to.split('?')[0]
                    ? 'text-foreground'
                    : 'text-foreground/55 hover:text-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-5">
            <Link to="/urunler?ara=" aria-label="Arama" className="hidden sm:block text-foreground/55 hover:text-foreground transition-colors">
              <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </Link>

            {isAuthenticated() && (
              <Link to="/hesabim/favoriler" aria-label="Favoriler" className="text-foreground/55 hover:text-foreground transition-colors">
                <Heart className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </Link>
            )}

            <Link
              to={isAuthenticated() ? '/hesabim' : '/giris'}
              aria-label="Hesabım"
              className="text-foreground/55 hover:text-foreground transition-colors"
            >
              <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </Link>

            <button
              onClick={open}
              aria-label="Sepet"
              className="relative text-foreground/55 hover:text-foreground transition-colors"
            >
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-earth text-[9px] font-semibold text-white leading-none">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav overlay */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background animate-fade-in">
            <nav className="container-site py-6 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="py-3 text-sm font-light text-foreground/70 hover:text-foreground border-b border-border/40 last:border-0 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-border/40">
                <Link to="/hesabim" className="py-2.5 text-sm text-foreground/60 hover:text-foreground transition-colors">
                  Hesabım
                </Link>
                <Link to="/hesabim/favoriler" className="py-2.5 text-sm text-foreground/60 hover:text-foreground transition-colors">
                  Favorilerim
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
