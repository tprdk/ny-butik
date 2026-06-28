import { Helmet } from 'react-helmet-async'

export default function NotFoundPage() {
  return (
    <>
      <Helmet><title>Sayfa Bulunamadı — NY Butik</title></Helmet>
      <div className="container py-8"><p>NotFoundPage</p></div>
    </>
  )
}
