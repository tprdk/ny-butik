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
  phone: z
    .string()
    .optional()
    .refine((v) => !v || /^(\+90|0)?[0-9]{10}$/.test(v), 'Geçerli bir telefon giriniz.'),
})

type ProfileFormData = z.infer<typeof profileSchema>

function ChangePasswordSection() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  const inputClass = (hasError: boolean) =>
    cn(
      'w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors',
      'focus:border-primary focus:ring-1 focus:ring-primary',
      hasError ? 'border-destructive' : 'border-input'
    )

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ChangePasswordFormData) =>
      apiClient.put('/users/me/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    onSuccess: () => {
      toast.success('Şifreniz güncellendi.')
      reset()
    },
    onError: () => toast.error('Şifre güncellenemedi. Mevcut şifrenizi kontrol edin.'),
  })

  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <h2 className="mb-4 font-serif text-lg font-semibold">Şifre Değiştir</h2>
      <form onSubmit={handleSubmit((d) => mutate(d))} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="currentPassword" className="text-sm font-medium">
            Mevcut Şifre
          </label>
          <input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            className={inputClass(!!errors.currentPassword)}
            {...register('currentPassword')}
          />
          {errors.currentPassword && (
            <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="newPassword" className="text-sm font-medium">
            Yeni Şifre
          </label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            className={inputClass(!!errors.newPassword)}
            {...register('newPassword')}
          />
          {errors.newPassword && (
            <p className="text-xs text-destructive">{errors.newPassword.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="newPasswordConfirm" className="text-sm font-medium">
            Yeni Şifre (Tekrar)
          </label>
          <input
            id="newPasswordConfirm"
            type="password"
            autoComplete="new-password"
            className={inputClass(!!errors.newPasswordConfirm)}
            {...register('newPasswordConfirm')}
          />
          {errors.newPasswordConfirm && (
            <p className="text-xs text-destructive">{errors.newPasswordConfirm.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Şifreyi Güncelle
          </button>
        </div>
      </form>
    </div>
  )
}

export default function ProfilePage() {
  const queryClient = useQueryClient()
  const { setAuth, accessToken } = useAuthStore()

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['profile'],
    queryFn: () =>
      apiClient.get<ApiResponse<User>>('/users/me').then((r) => r.data.data),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: user
      ? { firstName: user.firstName, lastName: user.lastName, phone: user.phone ?? '' }
      : undefined,
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

  const inputClass = (hasError: boolean) =>
    cn(
      'w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors',
      'focus:border-primary focus:ring-1 focus:ring-primary',
      hasError ? 'border-destructive' : 'border-input'
    )

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-xl bg-muted" />
  }

  return (
    <>
      <Helmet>
        <title>Profilim — NY Butik</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Profilim</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kişisel bilgilerinizi güncelleyin</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-6">
          <form onSubmit={handleSubmit((d) => updateProfile(d))} noValidate className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="firstName" className="text-sm font-medium">Ad</label>
                <input id="firstName" className={inputClass(!!errors.firstName)} {...register('firstName')} />
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="lastName" className="text-sm font-medium">Soyad</label>
                <input id="lastName" className={inputClass(!!errors.lastName)} {...register('lastName')} />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">E-posta</label>
              <input
                value={user?.email ?? ''}
                disabled
                className="w-full rounded-lg border border-input bg-muted px-3.5 py-2.5 text-sm text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">E-posta adresi değiştirilemez.</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-medium">Telefon</label>
              <input
                id="phone"
                type="tel"
                placeholder="05XX XXX XX XX"
                className={inputClass(!!errors.phone)}
                {...register('phone')}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Kaydet
              </button>
            </div>
          </form>
        </div>

        <ChangePasswordSection />
      </div>
    </>
  )
}
