import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-brand-dark text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <p className="font-serif text-xl font-semibold">NY Butik</p>
            <p className="mt-2 text-sm text-white/60">
              Modern tesettür giyimde yeni adresiniz.
            </p>
          </div>
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">Kurumsal</p>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/hakkimizda" className="hover:text-white transition-colors">Hakkımızda</Link></li>
              <li><Link to="/iletisim" className="hover:text-white transition-colors">İletişim</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">Yardım</p>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/kargo-ve-iade" className="hover:text-white transition-colors">Kargo & İade</Link></li>
              <li><Link to="/gizlilik-politikasi" className="hover:text-white transition-colors">Gizlilik Politikası</Link></li>
              <li><Link to="/kullanim-kosullari" className="hover:text-white transition-colors">Kullanım Koşulları</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} NY Butik. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  )
}
