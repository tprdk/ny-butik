import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, Pencil, Trash2, MapPin, Star, X } from 'lucide-react'
import { toast } from 'sonner'
import { addressApi, type Address } from '@/api/address.api'
import { addressSchema, type AddressFormValues } from '@/schemas/address.schema'
import { cn } from '@/lib/utils'

const MAX_ADDRESSES = 5
const ADDRESSES_KEY = ['addresses']

function AddressModal({ address, onClose }: { address: Address | null; onClose: () => void }) {
  const qc = useQueryClient()
  const isEdit = address !== null

  const { register, handleSubmit, formState: { errors } } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: address
      ? { label: address.label ?? '', firstName: address.firstName, lastName: address.lastName, phone: address.phone, addressLine1: address.addressLine1, addressLine2: address.addressLine2 ?? '', city: address.city, district: address.district, postalCode: address.postalCode, isDefault: address.isDefault }
      : { label: '', firstName: '', lastName: '', phone: '', addressLine1: '', addressLine2: '', city: '', district: '', postalCode: '', isDefault: false },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: AddressFormValues) => {
      const payload = { ...data, label: data.label || undefined, addressLine2: data.addressLine2 || undefined }
      return isEdit ? addressApi.update(address!.id, payload) : addressApi.create(payload)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ADDRESSES_KEY }); toast.success(isEdit ? 'Adres güncellendi.' : 'Adres eklendi.'); onClose() },
    onError: () => toast.error('Bir hata oluştu.'),
  })

  const inputCls = (err: boolean) => cn('input', err && 'border-destructive')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-background" style={{ boxShadow: '0 20px 60px rgba(28,22,18,0.2)' }}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-serif text-lg font-light">{isEdit ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Kapat">
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => mutate(d))} noValidate className="max-h-[75vh] overflow-y-auto p-6 space-y-4">
          <div>
            <label htmlFor="label" className="input-label">Adres Etiketi <span className="text-muted-foreground/60">(opsiyonel)</span></label>
            <input id="label" placeholder="Ev, İş, vb." className={inputCls(!!errors.label)} {...register('label')} />
            {errors.label && <p className="mt-1.5 text-xs text-destructive">{errors.label.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { id: 'firstName', label: 'Ad', err: errors.firstName },
              { id: 'lastName', label: 'Soyad', err: errors.lastName },
            ].map(({ id, label, err }) => (
              <div key={id}>
                <label htmlFor={id} className="input-label">{label} <span className="text-destructive">*</span></label>
                <input id={id} className={inputCls(!!err)} {...register(id as keyof AddressFormValues)} />
                {err && <p className="mt-1.5 text-xs text-destructive">{err.message}</p>}
              </div>
            ))}
          </div>

          <div>
            <label htmlFor="phone" className="input-label">Telefon <span className="text-destructive">*</span></label>
            <input id="phone" type="tel" placeholder="05XX XXX XX XX" className={inputCls(!!errors.phone)} {...register('phone')} />
            {errors.phone && <p className="mt-1.5 text-xs text-destructive">{errors.phone.message}</p>}
          </div>

          <div>
            <label htmlFor="addressLine1" className="input-label">Adres Satırı 1 <span className="text-destructive">*</span></label>
            <input id="addressLine1" placeholder="Mahalle, cadde, sokak, bina no, kat..." className={inputCls(!!errors.addressLine1)} {...register('addressLine1')} />
            {errors.addressLine1 && <p className="mt-1.5 text-xs text-destructive">{errors.addressLine1.message}</p>}
          </div>

          <div>
            <label htmlFor="addressLine2" className="input-label">Adres Satırı 2 <span className="text-muted-foreground/60">(opsiyonel)</span></label>
            <input id="addressLine2" placeholder="Daire, ek bilgi..." className={inputCls(!!errors.addressLine2)} {...register('addressLine2')} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { id: 'city', label: 'Şehir', err: errors.city },
              { id: 'district', label: 'İlçe', err: errors.district },
              { id: 'postalCode', label: 'Posta Kodu', err: errors.postalCode, placeholder: '34XXX' },
            ].map(({ id, label, err, placeholder }) => (
              <div key={id}>
                <label htmlFor={id} className="input-label">{label} <span className="text-destructive">*</span></label>
                <input id={id} placeholder={placeholder} className={inputCls(!!err)} {...register(id as keyof AddressFormValues)} />
                {err && <p className="mt-1.5 text-xs text-destructive">{err.message}</p>}
              </div>
            ))}
          </div>

          <label className="flex cursor-pointer items-center gap-3 mt-2">
            <input type="checkbox" className="h-4 w-4 border-border accent-foreground" {...register('isDefault')} />
            <span className="text-sm font-light">Varsayılan adresim olarak ayarla</span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline">İptal</button>
            <button type="submit" disabled={isPending} className="btn-primary gap-2">
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isEdit ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AddressesPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  const { data: addresses = [], isLoading } = useQuery<Address[]>({
    queryKey: ADDRESSES_KEY,
    queryFn: addressApi.getAll,
  })

  const deleteMutation = useMutation({
    mutationFn: addressApi.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ADDRESSES_KEY }); toast.success('Adres silindi.') },
    onError: () => toast.error('Adres silinemedi.'),
  })

  const setDefaultMutation = useMutation({
    mutationFn: addressApi.setDefault,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ADDRESSES_KEY }); toast.success('Varsayılan adres güncellendi.') },
    onError: () => toast.error('Bir hata oluştu.'),
  })

  if (isLoading) return (
    <div className="space-y-3">
      {[1, 2].map((i) => <div key={i} className="h-40 animate-pulse bg-accent border border-border" />)}
    </div>
  )

  return (
    <>
      <Helmet><title>Adreslerim — NY Butik</title></Helmet>

      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-2xl font-light text-foreground">Adreslerim</h1>
            <p className="mt-1 text-xs text-muted-foreground">{addresses.length}/{MAX_ADDRESSES} adres kayıtlı</p>
          </div>
          <button
            onClick={() => { setEditingAddress(null); setModalOpen(true) }}
            disabled={addresses.length >= MAX_ADDRESSES}
            className="btn-primary btn-sm gap-2"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            Yeni Adres
          </button>
        </div>

        {addresses.length >= MAX_ADDRESSES && (
          <div className="border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm font-light text-amber-800">
            En fazla {MAX_ADDRESSES} adres kaydedebilirsiniz.
          </div>
        )}

        {addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-border py-16 text-center">
            <MapPin className="mb-4 h-9 w-9 text-border" strokeWidth={1} />
            <p className="text-sm font-light text-foreground mb-1">Henüz kayıtlı adresiniz yok.</p>
            <p className="text-xs text-muted-foreground mb-5">Sipariş verirken kullanmak için adres ekleyin.</p>
            <button onClick={() => { setEditingAddress(null); setModalOpen(true) }} className="btn-primary btn-sm gap-2">
              <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
              Adres Ekle
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={cn('relative border p-5', address.isDefault ? 'border-brand-earth/40 bg-brand-cream' : 'border-border bg-background')}
              >
                {address.isDefault && (
                  <span className="absolute right-4 top-4 flex items-center gap-1 text-[10px] tracking-wide uppercase text-brand-earth">
                    <Star className="h-3 w-3 fill-brand-earth text-brand-earth" />
                    Varsayılan
                  </span>
                )}

                {address.label && (
                  <p className="text-[10px] tracking-[0.12em] uppercase text-muted-foreground mb-2">{address.label}</p>
                )}

                <p className="text-sm font-light text-foreground">{address.firstName} {address.lastName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{address.phone}</p>
                <p className="mt-2 text-xs text-foreground font-light">{address.addressLine1}</p>
                {address.addressLine2 && <p className="text-xs text-foreground font-light">{address.addressLine2}</p>}
                <p className="text-xs text-foreground font-light">{address.district} / {address.city} {address.postalCode}</p>
                <p className="text-xs text-foreground font-light">{address.country}</p>

                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => { setEditingAddress(address); setModalOpen(true) }}
                    className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Pencil className="h-3 w-3" strokeWidth={1.5} />
                    Düzenle
                  </button>
                  <button
                    onClick={() => window.confirm('Bu adresi silmek istediğinize emin misiniz?') && deleteMutation.mutate(address.id)}
                    disabled={deleteMutation.isPending}
                    className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs text-destructive/70 hover:text-destructive hover:border-destructive/30 transition-colors disabled:opacity-60"
                  >
                    <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                    Sil
                  </button>
                  {!address.isDefault && (
                    <button
                      onClick={() => setDefaultMutation.mutate(address.id)}
                      disabled={setDefaultMutation.isPending}
                      className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs text-brand-earth hover:underline disabled:opacity-60"
                    >
                      <Star className="h-3 w-3" strokeWidth={1.5} />
                      Varsayılan Yap
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && <AddressModal address={editingAddress} onClose={() => setModalOpen(false)} />}
    </>
  )
}
