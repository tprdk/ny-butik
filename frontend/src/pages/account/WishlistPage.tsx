import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useWishlist } from '@/hooks/useWishlist'
import { formatPrice } from '@/lib/format'

export default function WishlistPage() {
  const { items, toggle, isPending } = useWishlist()

  return (
    <>
      <Helmet>
        <title>Favorilerim — NY Butik</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Favorilerim</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} ürün
          </p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <Heart className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-medium text-muted-foreground">Henüz favori ürününüz yok.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Beğendiğiniz ürünleri kalp ikonuna tıklayarak kaydedin.
            </p>
            <Link
              to="/urunler"
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Ürünleri Keşfet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {items.map((item) => {
              const hasDiscount = item.minSalePrice != null

              return (
                <div
                  key={item.wishlistId}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-100 bg-white hover:shadow-md transition-shadow duration-200"
                >
                  <Link to={`/urunler/${item.slug}`} className="relative aspect-[3/4] block overflow-hidden bg-neutral-50">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-300">
                        <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}

                    {!item.inStock && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                        <span className="text-sm font-medium text-neutral-500">Tükendi</span>
                      </div>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col p-3">
                    <Link
                      to={`/urunler/${item.slug}`}
                      className="text-sm font-medium leading-snug text-neutral-900 line-clamp-2 hover:text-primary transition-colors"
                    >
                      {item.productName}
                    </Link>

                    <div className="mt-1.5 flex items-center gap-2">
                      {hasDiscount ? (
                        <>
                          <span className="text-sm font-bold text-rose-600">
                            {formatPrice(item.minSalePrice!)}
                          </span>
                          <span className="text-xs text-neutral-400 line-through">
                            {formatPrice(item.minPrice)}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-neutral-900">
                          {formatPrice(item.minPrice)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => toggle(item.productId)}
                      disabled={isPending}
                      className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-60"
                    >
                      <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
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
