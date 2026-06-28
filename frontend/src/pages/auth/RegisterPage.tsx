import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { registerSchema, type RegisterFormData } from '@/schemas/auth.schema'
import { useRegister } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: doRegister, isPending } = useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) })

  const inputClass = (hasError: boolean) =>
    cn(
      'w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors',
      'placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary',
      hasError ? 'border-destructive' : 'border-input'
    )

  return (
    <>
      <Helmet>
        <title>Kayıt Ol — NY Butik</title>
      </Helmet>

      <div className="flex min-h-screen items-center justify-center bg-brand-cream px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 text-center">
            <Link to="/" className="font-serif text-3xl font-semibold text-primary">
              NY Butik
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">Ücretsiz hesap oluşturun</p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <form onSubmit={handleSubmit((d) => doRegister(d))} noValidate className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field id="firstName" label="Ad" error={errors.firstName?.message}>
                  <input
                    id="firstName"
                    autoComplete="given-name"
                    className={inputClass(!!errors.firstName)}
                    {...register('firstName')}
                  />
                </Field>
                <Field id="lastName" label="Soyad" error={errors.lastName?.message}>
                  <input
                    id="lastName"
                    autoComplete="family-name"
                    className={inputClass(!!errors.lastName)}
                    {...register('lastName')}
                  />
                </Field>
              </div>

              <Field id="email" label="E-posta" error={errors.email?.message}>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="ornek@email.com"
                  className={inputClass(!!errors.email)}
                  {...register('email')}
                />
              </Field>

              <Field id="password" label="Şifre" error={errors.password?.message}>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="En az 8 karakter"
                    className={cn(inputClass(!!errors.password), 'pr-10')}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              <Field id="passwordConfirm" label="Şifre Tekrar" error={errors.passwordConfirm?.message}>
                <input
                  id="passwordConfirm"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={inputClass(!!errors.passwordConfirm)}
                  {...register('passwordConfirm')}
                />
              </Field>

              <button
                type="submit"
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Hesap Oluştur
              </button>

              <p className="text-center text-xs text-muted-foreground">
                Kaydolarak{' '}
                <Link to="/kullanim-kosullari" className="underline underline-offset-2">
                  Kullanım Koşulları
                </Link>
                'nı kabul etmiş olursunuz.
              </p>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Zaten hesabınız var mı?{' '}
            <Link to="/giris" className="font-medium text-primary underline-offset-2 hover:underline">
              Giriş yapın
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  )
}
