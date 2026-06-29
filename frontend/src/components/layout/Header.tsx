import { Link } from 'react-router-dom'
import { ShoppingBag, Heart, User, Search, Menu } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'
import { useCart } from '@/hooks/useCart'

export default function Header() {
  const { isAuthenticated } = useAuthStore()
  const { open } = useCartStore()
  const { itemCount } = useCart()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-serif text-2xl font-semibold tracking-tight text-primary">
          NY Butik
        </Link>

        {/* Nav — desktop */}
        <nav className="hidden gap-8 md:flex">
          <Link to="/urunler" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Ürünler
          </Link>
          <Link to="/kategori/kiyafet" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Kıyafet
          </Link>
          <Link to="/kategori/aksesuarlar" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Aksesuarlar
          </Link>
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-4">
          <button aria-label="Arama" className="text-muted-foreground transition-colors hover:text-primary">
            <Search className="h-5 w-5" />
          </button>

          {isAuthenticated() && (
            <Link to="/hesabim/favoriler" aria-label="Favoriler" className="text-muted-foreground transition-colors hover:text-primary">
              <Heart className="h-5 w-5" />
            </Link>
          )}

          <Link to={isAuthenticated() ? '/hesabim' : '/giris'} aria-label="Hesabım" className="text-muted-foreground transition-colors hover:text-primary">
            <User className="h-5 w-5" />
          </Link>

          <button
            onClick={open}
            aria-label="Sepet"
            className="relative text-muted-foreground transition-colors hover:text-primary"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>

          <button aria-label="Menü" className="text-muted-foreground transition-colors hover:text-primary md:hidden">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
