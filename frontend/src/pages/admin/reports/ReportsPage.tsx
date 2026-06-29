import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { dashboardApi } from '@/api/dashboard.api'
import { formatPrice } from '@/lib/format'

function toDateInput(d: Date) {
  return d.toISOString().split('T')[0]
}

export default function ReportsPage() {
  const defaultTo = toDateInput(new Date())
  const defaultFrom = toDateInput(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))

  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(defaultTo)
  const [fetch, setFetch] = useState(false)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'reports', 'sales', from, to],
    queryFn: () => dashboardApi.getSalesReport(from, to),
    enabled: fetch,
  })

  const handleExport = async () => {
    try {
      await dashboardApi.exportCsv(from, to)
      toast.success('CSV indirildi')
    } catch {
      toast.error('CSV indirme başarısız')
    }
  }

  return (
    <>
      <Helmet><title>Raporlar — NY Butik Admin</title></Helmet>

      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Satış Raporları</h1>

        <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-white p-4">
          <div>
            <label className="mb-1 block text-sm text-gray-600">Başlangıç</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Bitiş</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <button
            onClick={() => setFetch(true)}
            disabled={isLoading || isFetching}
            className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {isFetching ? 'Yükleniyor...' : 'Rapor Getir'}
          </button>
          {data && (
            <button
              onClick={handleExport}
              className="rounded-lg border px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              CSV İndir
            </button>
          )}
        </div>

        {data && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-white p-4">
                <p className="text-sm text-gray-500">Toplam Sipariş</p>
                <p className="mt-1 text-3xl font-bold">{data.totalOrders.toLocaleString('tr-TR')}</p>
              </div>
              <div className="rounded-lg border bg-white p-4">
                <p className="text-sm text-gray-500">Toplam Gelir</p>
                <p className="mt-1 text-3xl font-bold text-green-700">{formatPrice(data.totalRevenue)}</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr className="text-left text-gray-500">
                    <th className="px-4 py-3">Tarih</th>
                    <th className="px-4 py-3 text-right">Sipariş Sayısı</th>
                    <th className="px-4 py-3 text-right">Gelir</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.rows.map((row) => (
                    <tr key={row.date} className="text-gray-700 hover:bg-gray-50">
                      <td className="px-4 py-3">{row.date}</td>
                      <td className="px-4 py-3 text-right">{row.orderCount}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatPrice(row.revenue)}</td>
                    </tr>
                  ))}
                  {data.rows.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                        Seçilen tarih aralığında sipariş bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
                {data.rows.length > 0 && (
                  <tfoot className="border-t bg-gray-50">
                    <tr className="font-semibold text-gray-900">
                      <td className="px-4 py-3">Toplam</td>
                      <td className="px-4 py-3 text-right">{data.totalOrders}</td>
                      <td className="px-4 py-3 text-right">{formatPrice(data.totalRevenue)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </>
        )}
      </div>
    </>
  )
}
