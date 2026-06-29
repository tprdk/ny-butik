import { useState, useEffect } from 'react'

const STORAGE_KEY = 'ny-butik-cookie-consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [])

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-4 py-4 shadow-lg sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          Bu site, daha iyi bir deneyim sunmak için çerezler kullanmaktadır. Siteyi kullanmaya devam ederek{' '}
          <a href="/kvkk" className="underline hover:text-gray-900">
            Gizlilik Politikamızı
          </a>{' '}
          kabul etmiş olursunuz.
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={() => setVisible(false)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Reddet
          </button>
          <button
            onClick={accept}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Kabul Et
          </button>
        </div>
      </div>
    </div>
  )
}
