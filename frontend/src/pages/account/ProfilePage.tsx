import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Helmet } from 'react-helmet-async'
import { Loader2 } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/api/client'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/lib/utils'
import type { ApiResponse } from '@/types/api.types'
import type { User } from '@/types/user.types'
import { changePasswordSchema, type ChangePasswordFormData } from '@/schemas/auth.schema'

const profileSchema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır.').max(100),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır.').max(100),
  phone: z.string().optional().refine((v) => !v || /^(\+90|0)?[0-9]{10}$/.test(v), 'Geçerli bir telefon giriniz.'),
})

type ProfileFormData = z.infer<typeof profileSchema>

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border bg-background">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-xs tracking-[0.12em] uppercase text-muted-foreground font-medium">{title}</h2>
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  )
}

function ChangePasswordSection() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ChangePasswordFormData) =>
      apiClient.put('/users/me/password', { currentPassword: data.currentPassword, newPassword: data.newPassword }),
    onSuccess: () => { toast.success('Şifreniz güncellendi.'); reset() },
    onError: () => toast.error('Şifre güncellenemedi. Mevcut şifrenizi kontrol edin.'),
  })

  const inputCls = (err: boolean) => cn('input', err && 'border-destructive')

  return (
    <SectionCard title="Şifre Değiştir">
      <form onSubmit={handleSubmit((d) => mutate(d))} noValidate className="space-y-4 max-w-sm">
        {[
          { id: 'currentPassword', label: 'Mevcut Şifre', err: errors.currentPassword, ac: 'current-password' },
          { id: 'newPassword', label: 'Yeni Şifre', err: errors.newPassword, ac: 'new-password' },
          { id: 'newPasswordConfirm', label: 'Yeni Şifre (Tekrar)', err: errors.newPasswordConfirm, ac: 'new-password' },
        ].map(({ id, label, err, ac }) => (
          <div key={id}>
            <label htmlFor={id} className="input-label">{label}</label>
            <input id={id} type="password" autoComplete={ac} className={inputCls(!!err)} {...register(id as keyof ChangePasswordFormData)} />
            {err && <p className="mt-1.5 text-xs text-destructive">{err.message}</p>}
          </div>
        ))}
        <div className="flex justify-end pt-1">
          <button type="submit" disabled={isPending} className="btn-primary gap-2">
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Şifreyi Güncelle
          </button>
        </div>
      </form>
    </SectionCard>
  )
}

export default function ProfilePage() {
  const queryClient = useQueryClient()
  const { setAuth, accessToken } = useAuthStore()

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['profile'],
    queryFn: () => apiClient.get<ApiResponse<User>>('/users/me').then((r) => r.data.data),
  })

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: user ? { firstName: user.firstName, lastName: user.lastName, phone: user.phone ?? '' } : undefined,
  })

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: (data: ProfileFormData) =>
      apiClient.put<ApiResponse<User>>('/users/me', data).then((r) => r.data.data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated)
      if (accessToken) setAuth(updated, accessToken)
      toast.success('Profil güncellendi.')
    },
    onError: () => toast.error('Güncelleme başarısız.'),
  })

  const inputCls = (err: boolean) => cn('input', err && 'border-destructive')

  if (isLoading) return <div className="h-48 animate-pulse bg-accent" />

  return (
    <>
      <Helmet><title>Profilim — NY Butik</title></Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-light text-foreground">Profilim</h1>
          <p className="mt-1 text-sm text-muted-foreground font-light">Kişisel bilgilerinizi güncelleyin</p>
        </div>

        <SectionCard title="Kişisel Bilgiler">
          <form onSubmit={handleSubmit((d) => updateProfile(d))} noValidate className="space-y-4 max-w-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="input-label">Ad</label>
                <input id="firstName" className={inputCls(!!errors.firstName)} {...register('firstName')} />
                {errors.firstName && <p className="mt-1.5 text-xs text-destructive">{errors.firstName.message}</p>}
              </div>
              <div>
                <label htmlFor="lastName" className="input-label">Soyad</label>
                <input id="lastName" className={inputCls(!!errors.lastName)} {...register('lastName')} />
                {errors.lastName && <p className="mt-1.5 text-xs text-destructive">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="input-label">E-posta</label>
              <input
                value={user?.email ?? ''}
                disabled
                className="input bg-accent text-muted-foreground cursor-default"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">E-posta adresi değiştirilemez.</p>
            </div>

            <div>
              <label htmlFor="phone" className="input-label">Telefon</label>
              <input id="phone" type="tel" placeholder="05XX XXX XX XX" className={inputCls(!!errors.phone)} {...register('phone')} />
              {errors.phone && <p className="mt-1.5 text-xs text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="flex justify-end pt-1">
              <button type="submit" disabled={isPending} className="btn-primary gap-2">
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Kaydet
              </button>
            </div>
          </form>
        </SectionCard>

        <ChangePasswordSection />
      </div>
    </>
  )
}
