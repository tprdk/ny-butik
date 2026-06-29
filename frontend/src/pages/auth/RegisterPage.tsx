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
        <div className="hidden lg:flex lg:w-1/2 items-end p-14 relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #2C1A0E 0%, #4A2A15 30%, #6B3E1E 55%, #8B5A2B 70%, #3D2010 100%)' }}>
          {/* Earth glow layers */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 70% 60% at 80% 20%, rgba(183,120,60,0.2) 0%, transparent 65%), radial-gradient(ellipse 50% 50% at 15% 85%, rgba(139,80,30,0.15) 0%, transparent 60%)'
          }} />
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundSize: '200px 200px' }} />
          <div className="absolute right-8 top-1/2 -translate-y-1/2 font-serif text-[18rem] font-light leading-none opacity-[0.04] text-amber-200 select-none pointer-events-none">B</div>

          <div className="relative">
            <Link to="/" className="font-serif text-3xl font-light text-amber-50 tracking-wider">
              NY Butik
            </Link>
            <div className="mt-4 h-px w-12 bg-amber-300/30" />
            <p className="mt-4 text-sm font-light text-amber-100/35 leading-relaxed max-w-xs">
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
