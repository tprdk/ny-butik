import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
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
    try { await dashboardApi.exportCsv(from, to); toast.success('CSV indirildi') }
    catch { toast.error('CSV indirme başarısız') }
  }

  return (
    <>
      <Helmet><title>Raporlar — NY Butik Admin</title></Helmet>

      <div className="space-y-6">
        <h1 className="font-serif text-2xl font-light text-foreground">Satış Raporları</h1>

        <div className="flex flex-wrap items-end gap-4 border border-border bg-accent/40 p-5">
          {[
            { label: 'Başlangıç', value: from, onChange: setFrom },
            { label: 'Bitiş', value: to, onChange: setTo },
          ].map(({ label, value, onChange }) => (
            <div key={label}>
              <label className="input-label mb-1">{label}</label>
              <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className="input w-auto" />
            </div>
          ))}
          <button onClick={() => setFetch(true)} disabled={isLoading || isFetching} className="btn-primary gap-2">
            {isFetching && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isFetching ? 'Yükleniyor...' : 'Rapor Getir'}
          </button>
          {data && (
            <button onClick={handleExport} className="btn-outline">CSV İndir</button>
          )}
        </div>

        {data && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border border-border p-5">
                <p className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-2">Toplam Sipariş</p>
                <p className="text-3xl font-light text-foreground">{data.totalOrders.toLocaleString('tr-TR')}</p>
              </div>
              <div className="border border-border p-5">
                <p className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-2">Toplam Gelir</p>
                <p className="text-3xl font-light text-green-700">{formatPrice(data.totalRevenue)}</p>
              </div>
            </div>

            <div className="border border-border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-accent/50">
                    {['Tarih', 'Sipariş Sayısı', 'Gelir'].map((h, i) => (
                      <th key={i} className={`px-4 py-3 text-[10px] tracking-[0.12em] uppercase text-muted-foreground font-medium ${i > 0 ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.rows.map((row) => (
                    <tr key={row.date} className="hover:bg-accent/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-light text-foreground">{row.date}</td>
                      <td className="px-4 py-3 text-right text-sm font-light text-foreground">{row.orderCount}</td>
                      <td className="px-4 py-3 text-right text-sm font-light text-foreground">{formatPrice(row.revenue)}</td>
                    </tr>
                  ))}
                  {data.rows.length === 0 && (
                    <tr><td colSpan={3} className="px-4 py-10 text-center text-sm font-light text-muted-foreground">Seçilen tarih aralığında sipariş bulunamadı.</td></tr>
                  )}
                </tbody>
                {data.rows.length > 0 && (
                  <tfoot className="border-t border-border bg-accent/50">
                    <tr className="font-medium text-foreground">
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
