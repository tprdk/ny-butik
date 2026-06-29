import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useFeaturedProducts, useCategories } from '@/hooks/useProducts'
import { ProductCard } from '@/components/catalog/ProductCard'
import { ProductCardSkeleton } from '@/components/catalog/ProductCardSkeleton'

export default function HomePage() {
  const { data: featured, isLoading: loadingFeatured } = useFeaturedProducts(8)
  const { data: categories } = useCategories()
  const rootCats = categories?.filter((c) => !c.parentId) ?? []

  const catIcon: Record<string, string> = {
    'kiyafet': '👗', 'ust-giyim': '👚', 'alt-giyim': '👖', 'dis-giyim': '🧥', 'aksesuarlar': '👜'
  }

  return (
    <div>
      <Helmet>
        <title>NY Butik — Tesettür Giyim</title>
        <meta name="description" content="NY Butik — modern tesettür giyimde kalite ve şıklık. Başörtüsü, tunik, abaya ve daha fazlası." />
        <meta property="og:title" content="NY Butik — Tesettür Giyim" />
        <meta property="og:description" content="Modern tesettür giyimde kalite ve şıklık. Başörtüsü, tunik, abaya ve daha fazlası." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.nybutik.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="NY Butik — Tesettür Giyim" />
        <meta name="twitter:description" content="Modern tesettür giyimde kalite ve şıklık." />
      </Helmet>
      {/* Hero */}
      <section className="relative bg-neutral-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 flex flex-col items-center text-center">
          <span className="text-sm font-medium text-neutral-400 tracking-widest uppercase mb-4">Tesettür Giyim</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 max-w-2xl">
            Şıklık ve Zerafetin Buluştuğu Yer
          </h1>
          <p className="text-neutral-300 text-lg mb-8 max-w-xl">
            Modern çizgiler, kaliteli kumaşlar ve özenle tasarlanmış koleksiyonlar.
          </p>
          <Link to="/urunler" className="inline-flex items-center gap-2 bg-white text-neutral-900 font-semibold px-8 py-3.5 rounded-full hover:bg-neutral-100 transition-colors">
            Koleksiyonu Keşfet <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Kategoriler */}
      {rootCats.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">Kategoriler</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {rootCats.map((cat) => (
              <Link key={cat.id} to={`/urunler?kategori=${cat.id}`}
                className="group flex flex-col items-center gap-2 p-4 border border-neutral-100 rounded-2xl hover:border-neutral-300 hover:shadow-sm transition-all">
                <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center group-hover:bg-neutral-200 transition-colors">
                  <span className="text-2xl">{catIcon[cat.slug] ?? '🛍️'}</span>
                </div>
                <span className="text-sm font-medium text-neutral-700">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Öne çıkan ürünler */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-neutral-900">Öne Çıkan Ürünler</h2>
          <Link to="/urunler" className="text-sm text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition-colors">
            Tümünü gör <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {loadingFeatured
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : featured?.content.length
            ? featured.content.map((p) => <ProductCard key={p.id} product={p} />)
            : (
              <div className="col-span-full text-center py-16 text-neutral-400">
                <p className="text-lg">Henüz ürün eklenmemiş</p>
                <p className="text-sm mt-1">Admin panelinden ürün eklenince burada görünecek.</p>
              </div>
            )}
        </div>
      </section>
    </div>
  )
}
