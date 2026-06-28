import { Helmet } from 'react-helmet-async'

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>NY Butik — Tesettür Giyimde Yeni Adresiniz</title>
        <meta name="description" content="Modern ve şık tesettür giyim koleksiyonlarını keşfedin." />
      </Helmet>

      {/* Hero */}
      <section className="bg-brand-cream py-24 text-center">
        <h1 className="font-serif text-4xl font-semibold text-primary md:text-6xl">
          Zarafetin Yeni Adresi
        </h1>
        <p className="mt-4 text-muted-foreground">
          Modern tesettür giyimde özenle seçilmiş koleksiyonlar
        </p>
        <a
          href="/urunler"
          className="mt-8 inline-block rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Koleksiyonu Keşfet
        </a>
      </section>
    </>
  )
}
