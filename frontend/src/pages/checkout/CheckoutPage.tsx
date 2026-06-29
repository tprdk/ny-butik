import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useMutation, useQuery } from '@tanstack/react-query'
import { MapPin, CreditCard, Package, CheckCircle, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
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

function AddressCard({ address, selected, onSelect }: { address: Address; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full border p-4 text-left transition-colors text-sm',
        selected ? 'border-foreground bg-accent' : 'border-border bg-background hover:bg-accent/50'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {address.label && (
            <span className="text-[10px] tracking-[0.12em] uppercase text-muted-foreground mb-1 block">{address.label}</span>
          )}
          <p className="font-light text-foreground">{address.firstName} {address.lastName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{address.phone}</p>
          <p className="text-xs text-muted-foreground">{address.addressLine1}</p>
          {address.addressLine2 && <p className="text-xs text-muted-foreground">{address.addressLine2}</p>}
          <p className="text-xs text-muted-foreground">{address.district} / {address.city} {address.postalCode}</p>
        </div>
        <div className={cn('mt-1 h-4 w-4 shrink-0 border-2 transition-colors flex items-center justify-center', selected ? 'border-foreground bg-foreground' : 'border-border')}>
          {selected && (
            <svg className="h-2.5 w-2.5 text-background" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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
    onSuccess: (data) => navigate(`/siparis-basarili/${data.orderNumber}`),
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Sipariş oluşturulurken bir hata oluştu.'
      toast.error(message)
    },
  })

  const handleStep1Next = () => {
    if (!shippingAddressId) { toast.error('Lütfen teslimat adresi seçin.'); return }
    if (!sameAddress && !billingAddressId) { toast.error('Lütfen fatura adresi seçin.'); return }
    if (sameAddress) setBillingAddressId(shippingAddressId)
    setStep(2)
  }

  const handleSubmit = () => {
    const billingId = sameAddress ? shippingAddressId : billingAddressId
    if (!shippingAddressId || !billingId) { toast.error('Adres bilgileri eksik.'); return }
    createOrder.mutate({ shippingAddressId, billingAddressId: billingId, paymentMethod: 'MOCK', notes: notes.trim() || undefined })
  }

  const cartItems = cart?.items ?? []
  const isEmpty = cartItems.length === 0

  return (
    <>
      <Helmet><title>Ödeme — NY Butik</title></Helmet>

      <div className="bg-background">
        <div className="container-site py-10">
          {/* Adım göstergesi */}
          <div className="mb-10">
            <div className="flex items-center max-w-sm mx-auto">
              {STEPS.map((s, idx) => {
                const Icon = s.icon
                const isCompleted = step > s.id
                const isCurrent = step === s.id
                return (
                  <div key={s.id} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={cn(
                        'flex h-9 w-9 items-center justify-center border-2 transition-colors',
                        isCompleted ? 'border-foreground bg-foreground text-background' :
                        isCurrent ? 'border-foreground bg-background text-foreground' :
                        'border-border bg-background text-muted-foreground'
                      )}>
                        {isCompleted ? <CheckCircle size={16} strokeWidth={1.5} /> : <Icon size={16} strokeWidth={1.5} />}
                      </div>
                      <span className={cn('text-[10px] tracking-wide', isCurrent || isCompleted ? 'text-foreground' : 'text-muted-foreground')}>
                        {s.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={cn('mx-2 mb-4 h-px flex-1 transition-colors', step > s.id ? 'bg-foreground' : 'bg-border')} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Ana içerik */}
            <div className="lg:col-span-2">

              {/* Step 1: Adres */}
              {step === 1 && (
                <div className="border border-border">
                  <div className="px-6 py-4 border-b border-border">
                    <h2 className="text-xs tracking-[0.12em] uppercase text-muted-foreground font-medium">Teslimat Adresi</h2>
                  </div>
                  <div className="p-6">
                    {addressesLoading ? (
                      <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                    ) : !addresses || addresses.length === 0 ? (
                      <div className="border border-dashed border-border p-10 text-center">
                        <MapPin className="mx-auto mb-3 h-9 w-9 text-border" strokeWidth={1} />
                        <p className="text-sm font-light text-foreground mb-1">Henüz kayıtlı adresiniz yok.</p>
                        <a href="/hesabim/adresler" className="text-xs text-brand-earth underline underline-offset-4">Adres ekleyin</a>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {addresses.map((addr) => (
                          <AddressCard key={addr.id} address={addr} selected={shippingAddressId === addr.id} onSelect={() => setShippingAddressId(addr.id)} />
                        ))}
                      </div>
                    )}

                    {addresses && addresses.length > 0 && (
                      <>
                        <div className="mt-6 border-t border-border pt-6">
                          <h3 className="text-xs tracking-[0.12em] uppercase text-muted-foreground font-medium mb-4">Fatura Adresi</h3>
                          <label className="flex cursor-pointer items-center gap-2.5">
                            <input type="checkbox" checked={sameAddress} onChange={(e) => setSameAddress(e.target.checked)} className="h-4 w-4 border-border accent-foreground" />
                            <span className="text-sm font-light">Fatura adresi teslimat adresiyle aynı</span>
                          </label>
                          {!sameAddress && (
                            <div className="mt-4 space-y-2">
                              {addresses.map((addr) => (
                                <AddressCard key={addr.id} address={addr} selected={billingAddressId === addr.id} onSelect={() => setBillingAddressId(addr.id)} />
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-6">
                          <label className="input-label mb-1.5">Sipariş Notu <span className="text-muted-foreground/60">(opsiyonel)</span></label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder="Teslimat ile ilgili bir notunuz varsa yazabilirsiniz..."
                            className="input resize-none"
                          />
                        </div>

                        <button type="button" onClick={handleStep1Next} className="btn-primary w-full justify-center py-3.5 mt-5 gap-2">
                          Ödemeye Geç <ChevronRight size={14} strokeWidth={1.5} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Ödeme */}
              {step === 2 && (
                <div className="border border-border">
                  <div className="px-6 py-4 border-b border-border">
                    <h2 className="text-xs tracking-[0.12em] uppercase text-muted-foreground font-medium">Ödeme Yöntemi</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="border-2 border-foreground bg-accent p-4 flex items-center gap-3">
                      <CreditCard size={18} strokeWidth={1.5} className="text-foreground" />
                      <div>
                        <p className="text-sm font-light text-foreground">Simülasyon Ödemesi</p>
                        <p className="text-xs text-muted-foreground">Demo ödeme yöntemi</p>
                      </div>
                    </div>

                    <div className="bg-accent border border-border px-4 py-3 text-sm font-light text-muted-foreground">
                      Demo modunda gerçek ödeme bilgisi istenmez. Sipariş otomatik onaylanacaktır.
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setStep(1)} className="btn-outline gap-2 flex-1 justify-center py-3">
                        <ChevronLeft size={14} strokeWidth={1.5} /> Geri
                      </button>
                      <button type="button" onClick={() => setStep(3)} className="btn-primary flex-1 justify-center py-3 gap-2">
                        Devam Et <ChevronRight size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Özet */}
              {step === 3 && (
                <div className="border border-border">
                  <div className="px-6 py-4 border-b border-border">
                    <h2 className="text-xs tracking-[0.12em] uppercase text-muted-foreground font-medium">Sipariş Özeti</h2>
                  </div>
                  <div className="p-6">
                    {isEmpty ? (
                      <p className="text-sm font-light text-muted-foreground">Sepetinizde ürün bulunmuyor.</p>
                    ) : (
                      <div className="divide-y divide-border">
                        {cartItems.map((item) => (
                          <div key={item.variantId} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.productName} className="h-16 w-16 object-cover" />
                            ) : (
                              <div className="flex h-16 w-16 items-center justify-center bg-brand-sand">
                                <Package size={18} className="text-border" strokeWidth={1} />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-light text-foreground">{item.productName}</p>
                              <p className="text-xs text-muted-foreground">{[item.colorName, item.sizeName].filter(Boolean).join(' / ')}</p>
                              <p className="text-xs text-muted-foreground">Adet: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-light text-foreground shrink-0">{formatPrice(item.lineTotal)}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {notes && (
                      <div className="mt-4 bg-accent border border-border px-4 py-3">
                        <p className="text-xs tracking-wide text-muted-foreground mb-1">Sipariş Notu</p>
                        <p className="text-sm font-light">{notes}</p>
                      </div>
                    )}

                    <div className="flex gap-3 mt-6">
                      <button type="button" onClick={() => setStep(2)} className="btn-outline flex-1 justify-center py-3 gap-2">
                        <ChevronLeft size={14} strokeWidth={1.5} /> Geri
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isEmpty || createOrder.isPending}
                        className="btn-primary flex-1 justify-center py-3 gap-2"
                      >
                        {createOrder.isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> İşleniyor...</> : <>Siparişi Tamamla <CheckCircle size={14} strokeWidth={1.5} /></>}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sepet özet sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 border border-border">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="text-xs tracking-[0.12em] uppercase text-muted-foreground font-medium">
                    Sepet ({cartItems.length} ürün)
                  </h3>
                </div>
                <div className="p-5">
                  {isEmpty ? (
                    <p className="text-sm font-light text-muted-foreground">Sepetiniz boş.</p>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {cartItems.map((item) => (
                          <div key={item.variantId} className="flex items-center gap-2.5 text-sm">
                            {item.imageUrl && (
                              <img src={item.imageUrl} alt={item.productName} className="h-10 w-10 object-cover" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-xs font-light text-foreground">{item.productName}</p>
                              <p className="text-[10px] text-muted-foreground">×{item.quantity}</p>
                            </div>
                            <span className="text-xs font-light text-foreground shrink-0">{formatPrice(item.lineTotal)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                        <div className="flex justify-between text-muted-foreground font-light">
                          <span>Ara toplam</span><span>{formatPrice(cart!.subtotal)}</span>
                        </div>
                        {cart!.discountAmount > 0 && (
                          <div className="flex justify-between text-green-700 font-light">
                            <span>İndirim</span><span>-{formatPrice(cart!.discountAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-muted-foreground font-light">
                          <span>Kargo</span>
                          <span>{cart!.shippingAmount === 0 ? <span className="text-green-700">Ücretsiz</span> : formatPrice(cart!.shippingAmount)}</span>
                        </div>
                        <div className="flex justify-between border-t border-border pt-2 font-medium text-foreground">
                          <span>Toplam</span><span>{formatPrice(cart!.total)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
