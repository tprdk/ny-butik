import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { registerSchema, type RegisterFormData } from '@/schemas/auth.schema'
import { useRegister } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="input-label">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  )
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: doRegister, isPending } = useRegister()

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const inputCls = (err: boolean) => cn('input', err && 'border-destructive focus:ring-destructive/20')

  return (
    <>
      <Helmet><title>Kayıt Ol — NY Butik</title></Helmet>

      <div className="flex min-h-screen bg-background">
        {/* Sol panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-brand-dark items-end p-14">
          <div>
            <Link to="/" className="font-serif text-3xl font-light text-white tracking-wider">
              NY Butik
            </Link>
            <p className="mt-3 text-sm font-light text-white/40 leading-relaxed max-w-xs">
              Ücretsiz hesap açarak kampanyalardan ve indirimlerden haberdar olun.
            </p>
          </div>
        </div>

        {/* Sağ panel */}
        <div className="flex flex-1 items-start justify-center px-6 py-14 overflow-y-auto">
          <div className="w-full max-w-sm">
            <div className="mb-8 lg:hidden text-center">
              <Link to="/" className="font-serif text-3xl font-light text-foreground tracking-wide">
                NY Butik
              </Link>
            </div>

            <h1 className="font-serif text-2xl font-light text-foreground mb-1">Hesap Oluştur</h1>
            <p className="text-sm text-muted-foreground mb-8">Ücretsiz kaydolun</p>

            <form onSubmit={handleSubmit((d) => doRegister(d))} noValidate className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field id="firstName" label="Ad" error={errors.firstName?.message}>
                  <input id="firstName" autoComplete="given-name" className={inputCls(!!errors.firstName)} {...register('firstName')} />
                </Field>
                <Field id="lastName" label="Soyad" error={errors.lastName?.message}>
                  <input id="lastName" autoComplete="family-name" className={inputCls(!!errors.lastName)} {...register('lastName')} />
                </Field>
              </div>

              <Field id="email" label="E-posta" error={errors.email?.message}>
                <input id="email" type="email" autoComplete="email" placeholder="ornek@email.com" className={inputCls(!!errors.email)} {...register('email')} />
              </Field>

              <Field id="password" label="Şifre" error={errors.password?.message}>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="En az 8 karakter"
                    className={cn(inputCls(!!errors.password), 'pr-10')}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                  </button>
                </div>
              </Field>

              <Field id="passwordConfirm" label="Şifre Tekrar" error={errors.passwordConfirm?.message}>
                <input
                  id="passwordConfirm"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={inputCls(!!errors.passwordConfirm)}
                  {...register('passwordConfirm')}
                />
              </Field>

              <button
                type="submit"
                disabled={isPending}
                className="btn-primary w-full justify-center py-3.5 mt-2"
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Hesap Oluştur
              </button>

              <p className="text-center text-[11px] text-muted-foreground">
                Kaydolarak{' '}
                <Link to="/kullanim-kosullari" className="underline underline-offset-2 hover:text-foreground transition-colors">
                  Kullanım Koşulları
                </Link>
                'nı kabul etmiş olursunuz.
              </p>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Zaten hesabınız var mı?{' '}
              <Link to="/giris" className="text-foreground underline underline-offset-4 hover:text-brand-earth transition-colors">
                Giriş yapın
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
