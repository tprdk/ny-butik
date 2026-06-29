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
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2C1A0E 0%, #4A2A15 25%, #6B3E1E 45%, #8B5A2B 60%, #4A2A15 80%, #1C1612 100%)' }}>
        {/* Warm earth radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 70% at 75% 50%, rgba(183,120,60,0.18) 0%, transparent 70%), radial-gradient(ellipse 40% 50% at 20% 80%, rgba(139,90,43,0.14) 0%, transparent 60%)'
        }} />
        {/* Subtle noise grain */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundSize: '180px 180px' }} />
        {/* Fine crosshatch */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(0deg, rgba(255,220,160,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,220,160,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="container-site relative py-28 sm:py-36 lg:py-44">
          {/* Decorative serif initial */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[22rem] font-serif font-light leading-none select-none pointer-events-none opacity-[0.04] text-amber-200 pr-8 hidden lg:block">
            N
          </div>

          <div className="max-w-2xl relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-amber-300/40" />
              <p className="text-[11px] tracking-[0.22em] uppercase text-amber-200/50 font-light">
                Yeni Sezon Koleksiyonu
              </p>
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light text-amber-50 leading-[1.1] text-balance mb-6">
              Zarafet Sadece<br className="hidden sm:block" /> Bir Tercih Değil
            </h1>
            <p className="text-amber-100/40 text-base font-light leading-relaxed mb-10 max-w-md">
              Özenle seçilmiş kumaşlar, modern kesimler ve tesettür estetiğinin en şık hali.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/urunler"
                className="inline-flex items-center gap-2.5 bg-amber-50 text-brand-dark text-sm font-medium px-7 py-3.5 hover:bg-white transition-colors"
              >
                Koleksiyonu Keşfet
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/urunler"
                className="inline-flex items-center gap-2 text-amber-200/50 text-sm font-light px-2 py-3.5 hover:text-amber-100 transition-colors border-b border-amber-300/20 hover:border-amber-300/50"
              >
                Tüm Ürünlere Bak
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom fade to cream */}
        <div className="absolute bottom-0 left-0 right-0 h-20" style={{ background: 'linear-gradient(to top, hsl(36,25%,97%) 0%, transparent 100%)' }} />
      </section>

      {/* Kategoriler */}
      {rootCats.length > 0 && (
        <section className="container-site py-16 sm:py-20">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="font-serif text-2xl font-light text-foreground">Kategoriler</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-border">
            {rootCats.map((cat) => (
              <Link
                key={cat.id}
                to={`/urunler?kategori=${cat.id}`}
                className="group bg-background hover:bg-accent transition-colors duration-200 p-8 flex flex-col items-center gap-3 text-center"
              >
                <div className="w-10 h-px bg-border group-hover:bg-brand-earth group-hover:w-14 transition-all duration-300" />
                <span className="text-sm font-light text-foreground/70 group-hover:text-foreground transition-colors mt-2">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Öne çıkan ürünler */}
      <section className="container-site pb-20 sm:pb-28">
        <div className="flex items-baseline justify-between mb-10">
          <h2 className="font-serif text-2xl font-light text-foreground">Öne Çıkan Ürünler</h2>
          <Link
            to="/urunler"
            className="text-[12px] tracking-wide uppercase text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
          >
            Tümünü Gör <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-border">
          {loadingFeatured
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-background"><ProductCardSkeleton /></div>
              ))
            : featured?.content.length
            ? featured.content.map((p) => (
                <div key={p.id} className="bg-background"><ProductCard product={p} /></div>
              ))
            : (
              <div className="col-span-full py-24 flex flex-col items-center justify-center gap-2 bg-background">
                <p className="text-muted-foreground font-light">Henüz ürün eklenmemiş.</p>
                <p className="text-xs text-muted-foreground/60">Admin panelinden ürün eklenince burada görünecek.</p>
              </div>
            )}
        </div>
      </section>

      {/* Alt bilgi şeridi */}
      <section className="bg-brand-sand border-t border-border">
        <div className="container-site py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { title: 'Ücretsiz Kargo', sub: '500 ₺ ve üzeri siparişlerde' },
              { title: 'Kolay İade', sub: '30 gün içinde ücretsiz iade' },
              { title: 'Güvenli Ödeme', sub: '256-bit SSL ile şifrelenmiş' },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center gap-1.5">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground font-light">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
