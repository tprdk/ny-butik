import { Link } from 'react-router-dom'

const LINKS = {
  kurumsal: [
    { label: 'Hakkımızda', to: '/hakkimizda' },
    { label: 'İletişim', to: '/iletisim' },
  ],
  yardim: [
    { label: 'Kargo & İade', to: '/kargo-ve-iade' },
    { label: 'Sıkça Sorulan Sorular', to: '/sss' },
    { label: 'Gizlilik Politikası', to: '/gizlilik-politikasi' },
    { label: 'Kullanım Koşulları', to: '/kullanim-kosullari' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white/70">
      <div className="container-site py-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <p className="font-serif text-2xl font-light tracking-wider text-white">NY Butik</p>
            <p className="mt-3 text-sm leading-relaxed text-white/50 max-w-xs">
              Modern tesettür giyimde kalite, şıklık ve rahatlığı bir araya getiriyoruz.
            </p>
            <div className="mt-6 flex gap-4">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"
                className="text-white/40 hover:text-white transition-colors text-xs tracking-widest uppercase">
                Instagram
              </a>
              <span className="text-white/20">·</span>
              <a href="https://pinterest.com" target="_blank" rel="noreferrer" aria-label="Pinterest"
                className="text-white/40 hover:text-white transition-colors text-xs tracking-widest uppercase">
                Pinterest
              </a>
            </div>
          </div>

          {/* Kurumsal */}
          <div>
            <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">
              Kurumsal
            </p>
            <ul className="space-y-3">
              {LINKS.kurumsal.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-white/50 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Yardım */}
          <div>
            <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">
              Yardım
            </p>
            <ul className="space-y-3">
              {LINKS.yardim.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-white/50 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-white/8 pt-7 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-white/25 tracking-wide">
            © {new Date().getFullYear()} NY Butik. Tüm hakları saklıdır.
          </p>
          <p className="text-[11px] text-white/25">
            Güvenli Ödeme · SSL Sertifikalı
          </p>
        </div>
      </div>
    </footer>
  )
}
