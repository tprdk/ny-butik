import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useWishlist } from '@/hooks/useWishlist'
import { formatPrice } from '@/lib/format'

export default function WishlistPage() {
  const { items, toggle, isPending } = useWishlist()

  return (
    <>
      <Helmet><title>Favorilerim — NY Butik</title></Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-light text-foreground">Favorilerim</h1>
          <p className="mt-1 text-xs text-muted-foreground">{items.length} ürün</p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-border py-16 text-center">
            <Heart className="mb-4 h-9 w-9 text-border" strokeWidth={1} />
            <p className="text-sm font-light text-foreground mb-1">Henüz favori ürününüz yok.</p>
            <p className="text-xs text-muted-foreground mb-5">
              Beğendiğiniz ürünleri kalp ikonuna tıklayarak kaydedin.
            </p>
            <Link to="/urunler" className="btn-primary btn-sm">Ürünleri Keşfet</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-border">
            {items.map((item) => {
              const hasDiscount = item.minSalePrice != null
              return (
                <div key={item.wishlistId} className="group flex flex-col bg-background">
                  <Link to={`/urunler/${item.slug}`} className="relative aspect-[3/4] block overflow-hidden bg-brand-sand">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <svg className="h-10 w-10 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {!item.inStock && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                        <span className="text-[10px] tracking-widest uppercase text-foreground/50">Tükendi</span>
                      </div>
                    )}
                  </Link>

                  <div className="flex flex-col p-3 flex-1">
                    <Link to={`/urunler/${item.slug}`} className="text-sm font-light text-foreground line-clamp-2 hover:text-brand-earth transition-colors mb-2">
                      {item.productName}
                    </Link>
                    <div className="flex items-baseline gap-2 mt-auto mb-3">
                      {hasDiscount ? (
                        <>
                          <span className="text-sm font-light text-brand-earth">{formatPrice(item.minSalePrice!)}</span>
                          <span className="text-xs text-muted-foreground line-through">{formatPrice(item.minPrice)}</span>
                        </>
                      ) : (
                        <span className="text-sm font-light text-foreground">{formatPrice(item.minPrice)}</span>
                      )}
                    </div>
                    <button
                      onClick={() => toggle(item.productId)}
                      disabled={isPending}
                      className="flex items-center justify-center gap-1.5 border border-border px-3 py-2 text-xs text-muted-foreground hover:border-foreground hover:text-foreground transition-colors disabled:opacity-60"
                    >
                      <Heart className="h-3 w-3" strokeWidth={1.5} />
                      Favoriden Çıkar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
