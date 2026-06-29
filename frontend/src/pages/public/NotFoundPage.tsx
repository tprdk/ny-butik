import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <>
      <Helmet>
        <title>Sayfa Bulunamadı — NY Butik</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <p className="text-8xl font-bold text-gray-200">404</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Sayfa Bulunamadı</h1>
        <p className="mt-2 text-gray-500">
          Aradığınız sayfa taşınmış veya kaldırılmış olabilir.
        </p>
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Geri Dön
          </button>
          <Link
            to="/"
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
          >
            Ana Sayfaya Git
          </Link>
        </div>
      </div>
    </>
  )
}
