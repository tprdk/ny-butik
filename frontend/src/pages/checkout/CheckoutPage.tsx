import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useMutation, useQuery } from '@tanstack/react-query'
import { MapPin, CreditCard, Package, CheckCircle, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { orderApi } from '@/api/order.api'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Address } from '@/types/order.types'

const STEPS = [
  { id: 1, label: 'Adres', icon: MapPin },
  { id: 2, label: 'Ödeme', icon: CreditCard },
  { id: 3, label: 'Özet', icon: Package },
]

function AddressCard({
  address,
  selected,
  onSelect,
}: {
  address: Address
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full rounded-lg border-2 p-4 text-left transition-colors',
        selected
          ? 'border-rose-500 bg-rose-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          {address.label && (
            <span className="mb-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {address.label}
            </span>
          )}
          <p className="font-semibold text-gray-900">
            {address.firstName} {address.lastName}
          </p>
          <p className="mt-1 text-sm text-gray-600">{address.phone}</p>
          <p className="mt-1 text-sm text-gray-600">{address.addressLine1}</p>
          {address.addressLine2 && (
            <p className="text-sm text-gray-600">{address.addressLine2}</p>
          )}
          <p className="text-sm text-gray-600">
            {address.district} / {address.city} {address.postalCode}
          </p>
        </div>
        <div
          className={cn(
            'mt-1 h-5 w-5 flex-shrink-0 rounded-full border-2 transition-colors',
            selected ? 'border-rose-500 bg-rose-500' : 'border-gray-300'
          )}
        >
          {selected && (
            <svg className="h-full w-full text-white" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>
    </button>
  )
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { cart } = useCart()

  const [step, setStep] = useState(1)
  const [shippingAddressId, setShippingAddressId] = useState<number | null>(null)
  const [billingAddressId, setBillingAddressId] = useState<number | null>(null)
  const [sameAddress, setSameAddress] = useState(true)
  const [notes, setNotes] = useState('')

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: orderApi.getAddresses,
  })

  const createOrder = useMutation({
    mutationFn: orderApi.createOrder,
    onSuccess: (data) => {
      navigate(`/siparis-basarili/${data.orderNumber}`)
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Sipariş oluşturulurken bir hata oluştu.'
      toast.error(message)
    },
  })

  const handleStep1Next = () => {
    if (!shippingAddressId) {
      toast.error('Lütfen teslimat adresi seçin.')
      return
    }
    if (!sameAddress && !billingAddressId) {
      toast.error('Lütfen fatura adresi seçin.')
      return
    }
    if (sameAddress) {
      setBillingAddressId(shippingAddressId)
    }
    setStep(2)
  }

  const handleStep2Next = () => {
    setStep(3)
  }

  const handleSubmit = () => {
    const billingId = sameAddress ? shippingAddressId : billingAddressId
    if (!shippingAddressId || !billingId) {
      toast.error('Adres bilgileri eksik.')
      return
    }
    createOrder.mutate({
      shippingAddressId: shippingAddressId,
      billingAddressId: billingId,
      paymentMethod: 'MOCK',
      notes: notes.trim() || undefined,
    })
  }

  const cartItems = cart?.items ?? []
  const isEmpty = cartItems.length === 0

  return (
    <>
      <Helmet>
        <title>Ödeme — NY Butik</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((s, idx) => {
                const Icon = s.icon
                const isCompleted = step > s.id
                const isCurrent = step === s.id
                return (
                  <div key={s.id} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                          isCompleted
                            ? 'border-rose-500 bg-rose-500 text-white'
                            : isCurrent
                            ? 'border-rose-500 bg-white text-rose-500'
                            : 'border-gray-300 bg-white text-gray-400'
                        )}
                      >
                        {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
                      </div>
                      <span
                        className={cn(
                          'mt-1 text-xs font-medium',
                          isCurrent || isCompleted ? 'text-rose-500' : 'text-gray-400'
                        )}
                      >
                        {s.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div
                        className={cn(
                          'mx-2 mb-4 h-0.5 flex-1 transition-colors',
                          step > s.id ? 'bg-rose-500' : 'bg-gray-200'
                        )}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2">
              {/* Step 1: Adres */}
              {step === 1 && (
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">Teslimat Adresi</h2>
                  {addressesLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
                    </div>
                  ) : !addresses || addresses.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                      <MapPin className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                      <p className="text-gray-600">Henüz kayıtlı adresiniz yok.</p>
                      <a
                        href="/hesabim/adresler"
                        className="mt-2 inline-block text-sm font-medium text-rose-600 hover:text-rose-700"
                      >
                        Adres ekleyin
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((addr) => (
                        <AddressCard
                          key={addr.id}
                          address={addr}
                          selected={shippingAddressId === addr.id}
                          onSelect={() => setShippingAddressId(addr.id)}
                        />
                      ))}
                    </div>
                  )}

                  {addresses && addresses.length > 0 && (
                    <>
                      <div className="mt-6 border-t pt-4">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">Fatura Adresi</h2>
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={sameAddress}
                            onChange={(e) => setSameAddress(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-rose-500 focus:ring-rose-400"
                          />
                          <span className="text-sm text-gray-700">
                            Fatura adresi teslimat adresiyle aynı
                          </span>
                        </label>

                        {!sameAddress && (
                          <div className="mt-4 space-y-3">
                            {addresses.map((addr) => (
                              <AddressCard
                                key={addr.id}
                                address={addr}
                                selected={billingAddressId === addr.id}
                                onSelect={() => setBillingAddressId(addr.id)}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-6">
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Sipariş Notu (opsiyonel)
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={3}
                          placeholder="Teslimat ile ilgili bir notunuz varsa yazabilirsiniz..."
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleStep1Next}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 py-3 text-sm font-semibold text-white hover:bg-rose-700 transition-colors"
                      >
                        Ödemeye Geç <ChevronRight size={16} />
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Step 2: Ödeme */}
              {step === 2 && (
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">Ödeme Yöntemi</h2>

                  <div className="rounded-lg border-2 border-rose-500 bg-rose-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Simülasyon Ödemesi</p>
                        <p className="text-sm text-gray-600">Demo ödeme yöntemi</p>
                      </div>
                      <div className="ml-auto h-5 w-5 rounded-full bg-rose-500 p-0.5">
                        <svg className="h-full w-full text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
                    <p className="font-medium">Demo Modu</p>
                    <p className="mt-1">
                      Demo modunda olduğunuz için gerçek ödeme bilgisi istenmez. Sipariş otomatik
                      olarak onaylanacaktır.
                    </p>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 rounded-lg border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Geri
                    </button>
                    <button
                      type="button"
                      onClick={handleStep2Next}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-rose-600 py-3 text-sm font-semibold text-white hover:bg-rose-700 transition-colors"
                    >
                      Devam Et <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Özet */}
              {step === 3 && (
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">Sipariş Özeti</h2>

                  {isEmpty ? (
                    <p className="text-gray-500">Sepetinizde ürün bulunmuyor.</p>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.variantId} className="flex items-center gap-4">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="h-16 w-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
                              <Package size={24} className="text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.productName}</p>
                            <p className="text-sm text-gray-500">
                              {[item.colorName, item.sizeName].filter(Boolean).join(' / ')}
                            </p>
                            <p className="text-sm text-gray-500">Adet: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            {formatPrice(item.lineTotal)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {notes && (
                    <div className="mt-4 rounded-lg bg-gray-50 p-3">
                      <p className="text-sm font-medium text-gray-700">Sipariş Notu:</p>
                      <p className="mt-1 text-sm text-gray-600">{notes}</p>
                    </div>
                  )}

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 rounded-lg border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Geri
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isEmpty || createOrder.isPending}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-rose-600 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
                    >
                      {createOrder.isPending ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          İşleniyor...
                        </>
                      ) : (
                        <>
                          Siparişi Tamamla <CheckCircle size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 rounded-xl bg-white p-5 shadow-sm">
                <h3 className="mb-4 font-semibold text-gray-900">Sepetim ({cartItems.length})</h3>
                {isEmpty ? (
                  <p className="text-sm text-gray-500">Sepetiniz boş.</p>
                ) : (
                  <>
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.variantId} className="flex items-center gap-2 text-sm">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="h-10 w-10 rounded object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="truncate font-medium text-gray-800">{item.productName}</p>
                            <p className="text-xs text-gray-500">x{item.quantity}</p>
                          </div>
                          <span className="font-medium text-gray-900">
                            {formatPrice(item.lineTotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 space-y-2 border-t pt-4 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Ara toplam</span>
                        <span>{formatPrice(cart!.subtotal)}</span>
                      </div>
                      {cart!.discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>İndirim</span>
                          <span>-{formatPrice(cart!.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-600">
                        <span>Kargo</span>
                        <span>
                          {cart!.shippingAmount === 0 ? (
                            <span className="font-medium text-green-600">Ücretsiz</span>
                          ) : (
                            formatPrice(cart!.shippingAmount)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2 font-semibold text-gray-900">
                        <span>Toplam</span>
                        <span>{formatPrice(cart!.total)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
