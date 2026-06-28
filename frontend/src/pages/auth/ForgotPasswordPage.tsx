import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/schemas/auth.schema'
import { cn } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = async (_data: ForgotPasswordFormData) => {
    setIsPending(true)
    // TODO Sprint 6: NotificationModule hazır olunca gerçek API çağrısı
    await new Promise((r) => setTimeout(r, 800))
    setIsPending(false)
    setSent(true)
  }

  return (
    <>
      <Helmet>
        <title>Şifremi Unuttum — NY Butik</title>
      </Helmet>

      <div className="flex min-h-screen items-center justify-center bg-brand-cream px-4">
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
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm">
            {sent ? (
              <div className="text-center space-y-4">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                <h2 className="font-serif text-xl font-semibold">E-posta Gönderildi</h2>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">{getValues('email')}</span> adresine şifre sıfırlama
                  bağlantısı gönderildi. Lütfen gelen kutunuzu kontrol edin.
                </p>
                <Link
                  to="/giris"
                  className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  Giriş Sayfasına Dön
                </Link>
              </div>
            ) : (
              <>
                <h2 className="mb-1 font-serif text-xl font-semibold">Şifremi Unuttum</h2>
                <p className="mb-6 text-sm text-muted-foreground">
                  E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-medium">
                      E-posta
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="ornek@email.com"
                      className={cn(
                        'w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors',
                        'placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary',
                        errors.email ? 'border-destructive' : 'border-input'
                      )}
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Bağlantı Gönder
                  </button>
                </form>
              </>
            )}
          </div>

          <Link
            to="/giris"
            className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Giriş sayfasına dön
          </Link>
        </motion.div>
      </div>
    </>
  )
}
