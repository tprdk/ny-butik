import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, Pencil, Trash2, MapPin, Star } from 'lucide-react'
import { toast } from 'sonner'
import { addressApi, type Address } from '@/api/address.api'
import { addressSchema, type AddressFormValues } from '@/schemas/address.schema'
import { cn } from '@/lib/utils'

const MAX_ADDRESSES = 5

const ADDRESSES_KEY = ['addresses']

function AddressModal({
  address,
  onClose,
}: {
  address: Address | null
  onClose: () => void
}) {
  const qc = useQueryClient()
  const isEdit = address !== null

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: address
      ? {
          label: address.label ?? '',
          firstName: address.firstName,
          lastName: address.lastName,
          phone: address.phone,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 ?? '',
          city: address.city,
          district: address.district,
          postalCode: address.postalCode,
          isDefault: address.isDefault,
        }
      : {
          label: '',
          firstName: '',
          lastName: '',
          phone: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          district: '',
          postalCode: '',
          isDefault: false,
        },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: AddressFormValues) => {
      const payload = {
        ...data,
        label: data.label || undefined,
        addressLine2: data.addressLine2 || undefined,
      }
      return isEdit
        ? addressApi.update(address!.id, payload)
        : addressApi.create(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADDRESSES_KEY })
      toast.success(isEdit ? 'Adres güncellendi.' : 'Adres eklendi.')
      onClose()
    },
    onError: () => toast.error('Bir hata oluştu.'),
  })

  const inputClass = (hasError: boolean) =>
    cn(
      'w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors',
      'focus:border-primary focus:ring-1 focus:ring-primary',
      hasError ? 'border-destructive' : 'border-input'
    )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-serif text-xl font-semibold">
            {isEdit ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit((d) => mutate(d))}
          noValidate
          className="max-h-[75vh] overflow-y-auto p-6"
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="label" className="text-sm font-medium">
                Adres Etiketi <span className="text-muted-foreground">(opsiyonel)</span>
              </label>
              <input
                id="label"
                placeholder="Ev, İş, vb."
                className={inputClass(!!errors.label)}
                {...register('label')}
              />
              {errors.label && (
                <p className="text-xs text-destructive">{errors.label.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="firstName" className="text-sm font-medium">
                  Ad <span className="text-destructive">*</span>
                </label>
                <input
                  id="firstName"
                  className={inputClass(!!errors.firstName)}
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Soyad <span className="text-destructive">*</span>
                </label>
                <input
                  id="lastName"
                  className={inputClass(!!errors.lastName)}
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-medium">
                Telefon <span className="text-destructive">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="05XX XXX XX XX"
                className={inputClass(!!errors.phone)}
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="addressLine1" className="text-sm font-medium">
                Adres Satırı 1 <span className="text-destructive">*</span>
              </label>
              <input
                id="addressLine1"
                placeholder="Mahalle, cadde, sokak, bina no, kat..."
                className={inputClass(!!errors.addressLine1)}
                {...register('addressLine1')}
              />
              {errors.addressLine1 && (
                <p className="text-xs text-destructive">{errors.addressLine1.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="addressLine2" className="text-sm font-medium">
                Adres Satırı 2 <span className="text-muted-foreground">(opsiyonel)</span>
              </label>
              <input
                id="addressLine2"
                placeholder="Daire, ek bilgi..."
                className={inputClass(!!errors.addressLine2)}
                {...register('addressLine2')}
              />
              {errors.addressLine2 && (
                <p className="text-xs text-destructive">{errors.addressLine2.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label htmlFor="city" className="text-sm font-medium">
                  Şehir <span className="text-destructive">*</span>
                </label>
                <input
                  id="city"
                  className={inputClass(!!errors.city)}
                  {...register('city')}
                />
                {errors.city && (
                  <p className="text-xs text-destructive">{errors.city.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="district" className="text-sm font-medium">
                  İlçe <span className="text-destructive">*</span>
                </label>
                <input
                  id="district"
                  className={inputClass(!!errors.district)}
                  {...register('district')}
                />
                {errors.district && (
                  <p className="text-xs text-destructive">{errors.district.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="postalCode" className="text-sm font-medium">
                  Posta Kodu <span className="text-destructive">*</span>
                </label>
                <input
                  id="postalCode"
                  placeholder="34XXX"
                  className={inputClass(!!errors.postalCode)}
                  {...register('postalCode')}
                />
                {errors.postalCode && (
                  <p className="text-xs text-destructive">{errors.postalCode.message}</p>
                )}
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-input accent-primary"
                {...register('isDefault')}
              />
              <span className="text-sm">Varsayılan adresim olarak ayarla</span>
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-input px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADDRESSES_KEY })
      toast.success('Adres silindi.')
    },
    onError: () => toast.error('Adres silinemedi.'),
  })

  const setDefaultMutation = useMutation({
    mutationFn: addressApi.setDefault,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADDRESSES_KEY })
      toast.success('Varsayılan adres güncellendi.')
    },
    onError: () => toast.error('Bir hata oluştu.'),
  })

  const openAdd = () => {
    setEditingAddress(null)
    setModalOpen(true)
  }

  const openEdit = (address: Address) => {
    setEditingAddress(address)
    setModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Bu adresi silmek istediğinize emin misiniz?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Adreslerim — NY Butik</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-semibold">Adreslerim</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {addresses.length}/{MAX_ADDRESSES} adres kayıtlı
            </p>
          </div>
          <button
            onClick={openAdd}
            disabled={addresses.length >= MAX_ADDRESSES}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Yeni Adres Ekle
          </button>
        </div>

        {addresses.length >= MAX_ADDRESSES && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            En fazla {MAX_ADDRESSES} adres kaydedebilirsiniz. Yeni adres eklemek için bir tanesini silin.
          </div>
        )}

        {addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <MapPin className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-medium text-muted-foreground">Henüz kayıtlı adresiniz yok.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Sipariş verirken kullanmak için adres ekleyin.
            </p>
            <button
              onClick={openAdd}
              className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Adres Ekle
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={cn(
                  'relative rounded-xl border bg-white p-5 transition-shadow hover:shadow-md',
                  address.isDefault ? 'border-rose-200' : 'border-border'
                )}
              >
                {address.isDefault && (
                  <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">
                    <Star className="h-3 w-3 fill-rose-500 text-rose-500" />
                    Varsayılan
                  </span>
                )}

                {address.label && (
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {address.label}
                  </p>
                )}

                <p className="font-medium text-foreground">
                  {address.firstName} {address.lastName}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">{address.phone}</p>
                <p className="mt-2 text-sm text-foreground">{address.addressLine1}</p>
                {address.addressLine2 && (
                  <p className="text-sm text-foreground">{address.addressLine2}</p>
                )}
                <p className="text-sm text-foreground">
                  {address.district} / {address.city} {address.postalCode}
                </p>
                <p className="text-sm text-foreground">{address.country}</p>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => openEdit(address)}
                    className="flex items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    disabled={deleteMutation.isPending}
                    className="flex items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Sil
                  </button>
                  {!address.isDefault && (
                    <button
                      onClick={() => setDefaultMutation.mutate(address.id)}
                      disabled={setDefaultMutation.isPending}
                      className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-60"
                    >
                      <Star className="h-3.5 w-3.5" />
                      Varsayılan Yap
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <AddressModal
          address={editingAddress}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}
