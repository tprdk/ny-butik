import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { loginSchema, type LoginFormData } from '@/schemas/auth.schema'
import { useLogin } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: login, isPending } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  return (
    <>
      <Helmet>
        <title>Giriş Yap — NY Butik</title>
      </Helmet>

      <div className="flex min-h-screen items-center justify-center bg-brand-cream px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <div className="mb-8 text-center">
            <Link to="/" className="font-serif text-3xl font-semibold text-primary">
              NY Butik
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">Hesabınıza giriş yapın</p>
          </div>

          {/* Card */}
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <form onSubmit={handleSubmit((d) => login(d))} noValidate className="space-y-5">
              {/* E-posta */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  E-posta
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="ornek@email.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className={cn(
                    'w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors',
                    'placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary',
                    errors.email ? 'border-destructive' : 'border-input'
                  )}
                  {...register('email')}
                />
                {errors.email && (
                  <p id="email-error" className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Şifre */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Şifre
                  </label>
                  <Link
                    to="/sifremi-unuttum"
                    className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                  >
                    Şifremi unuttum
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    className={cn(
                      'w-full rounded-lg border px-3.5 py-2.5 pr-10 text-sm outline-none transition-colors',
                      'placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary',
                      errors.password ? 'border-destructive' : 'border-input'
                    )}
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
                {errors.password && (
                  <p id="password-error" className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Giriş Yap
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Hesabınız yok mu?{' '}
            <Link to="/kayit" className="font-medium text-primary underline-offset-2 hover:underline">
              Ücretsiz kaydolun
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  )
}
