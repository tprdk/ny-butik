import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, ToggleLeft, ToggleRight, Tag } from 'lucide-react'
import { adminApi } from '@/api/admin.api'
import { formatPrice } from '@/lib/format'
import type { Coupon, CreateCouponPayload, DiscountType } from '@/types/coupon.types'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/api.types'

const EMPTY: CreateCouponPayload = {
  code: '', discountType: 'PERCENTAGE', discountValue: 10,
  minOrderAmount: null, maxUses: null, usesPerUser: 1,
  startsAt: null, expiresAt: null,
}

export default function CouponPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateCouponPayload>(EMPTY)
  const [formError, setFormError] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: () => adminApi.getCoupons(),
  })

  const save = useMutation({
    mutationFn: () => editing
      ? adminApi.updateCoupon(editing.id, form)
      : adminApi.createCoupon(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'coupons'] })
      setShowForm(false)
      setEditing(null)
      setForm(EMPTY)
      setFormError(null)
    },
    onError: (err: AxiosError<ApiError>) => {
      setFormError(err.response?.data?.detail ?? 'Bir hata oluştu')
    },
  })

  const toggle = useMutation({
    mutationFn: (id: number) => adminApi.toggleCoupon(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
  })

  const openNew = () => { setEditing(null); setForm(EMPTY); setFormError(null); setShowForm(true) }
  const openEdit = (c: Coupon) => {
    setEditing(c)
    setForm({
      code: c.code, discountType: c.discountType, discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount, maxUses: c.maxUses, usesPerUser: c.usesPerUser,
      startsAt: c.startsAt, expiresAt: c.expiresAt,
    })
    setFormError(null)
    setShowForm(true)
  }

  return (
    <>
      <Helmet><title>Kuponlar — NY Butik Admin</title></Helmet>

      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Kuponlar</h1>
            <p className="text-sm text-gray-500">{data?.totalElements ?? 0} kupon</p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors"
          >
            <Plus size={16} />
            Yeni Kupon
          </button>
        </div>

        {/* Form modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
              <h2 className="mb-4 text-lg font-semibold">{editing ? 'Kuponu Düzenle' : 'Yeni Kupon'}</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700">Kupon Kodu *</label>
                    <input
                      value={form.code}
                      onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                      placeholder="YAZA20"
                      className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">İndirim Türü *</label>
                    <select
                      value={form.discountType}
                      onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as DiscountType }))}
                      className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                    >
                      <option value="PERCENTAGE">Yüzde (%)</option>
                      <option value="FIXED_AMOUNT">Sabit Tutar (₺)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700">
                      İndirim Değeri * {form.discountType === 'PERCENTAGE' ? '(%)' : '(₺)'}
                    </label>
                    <input
                      type="number" min={0} step={form.discountType === 'PERCENTAGE' ? 1 : 0.01}
                      value={form.discountValue}
                      onChange={(e) => setForm((f) => ({ ...f, discountValue: Number(e.target.value) }))}
                      className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Min. Sipariş Tutarı (₺)</label>
                    <input
                      type="number" min={0} step={0.01}
                      value={form.minOrderAmount ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value ? Number(e.target.value) : null }))}
                      placeholder="Yok"
                      className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700">Maks. Kullanım</label>
                    <input
                      type="number" min={1}
                      value={form.maxUses ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value ? Number(e.target.value) : null }))}
                      placeholder="Sınırsız"
                      className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Kişi Başı Kullanım</label>
                    <input
                      type="number" min={1}
                      value={form.usesPerUser ?? 1}
                      onChange={(e) => setForm((f) => ({ ...f, usesPerUser: Number(e.target.value) }))}
                      className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700">Başlangıç Tarihi</label>
                    <input
                      type="datetime-local"
                      value={form.startsAt ? form.startsAt.slice(0, 16) : ''}
                      onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                      className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Bitiş Tarihi</label>
                    <input
                      type="datetime-local"
                      value={form.expiresAt ? form.expiresAt.slice(0, 16) : ''}
                      onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                      className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                </div>
              </div>
              {formError && <p className="mt-3 text-sm text-red-500">{formError}</p>}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => { setShowForm(false); setEditing(null) }}
                  className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  onClick={() => save.mutate()}
                  disabled={save.isPending || !form.code}
                  className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
                >
                  {save.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tablo */}
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Kod</th>
                  <th className="px-4 py-3 text-left">İndirim</th>
                  <th className="px-4 py-3 text-left">Min. Tutar</th>
                  <th className="px-4 py-3 text-left">Kullanım</th>
                  <th className="px-4 py-3 text-left">Geçerlilik</th>
                  <th className="px-4 py-3 text-left">Durum</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.content.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      <Tag size={32} className="mx-auto mb-2 text-gray-200" />
                      Henüz kupon oluşturulmadı
                    </td>
                  </tr>
                )}
                {data?.content.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-semibold text-gray-900">{coupon.code}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {coupon.discountType === 'PERCENTAGE'
                        ? `%${coupon.discountValue}`
                        : formatPrice(coupon.discountValue)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {coupon.minOrderAmount ? formatPrice(coupon.minOrderAmount) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {coupon.usedCount} / {coupon.maxUses ?? '∞'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {coupon.expiresAt
                        ? new Date(coupon.expiresAt).toLocaleDateString('tr-TR')
                        : 'Süresiz'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {coupon.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(coupon)}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          title="Düzenle"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => toggle.mutate(coupon.id)}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          title={coupon.isActive ? 'Pasife al' : 'Aktif et'}
                        >
                          {coupon.isActive ? <ToggleRight size={15} className="text-green-600" /> : <ToggleLeft size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
