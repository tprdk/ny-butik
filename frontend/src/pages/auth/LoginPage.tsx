import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { loginSchema, type LoginFormData } from '@/schemas/auth.schema'
import { useLogin } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: login, isPending } = useLogin()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  return (
    <>
      <Helmet><title>Giriş Yap — NY Butik</title></Helmet>

      <div className="flex min-h-screen bg-background">
        {/* Sol panel — dekoratif */}
        <div className="hidden lg:flex lg:w-1/2 items-end p-14 relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #2C1A0E 0%, #4A2A15 30%, #6B3E1E 55%, #8B5A2B 70%, #3D2010 100%)' }}>
          {/* Earth glow layers */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 70% 60% at 80% 20%, rgba(183,120,60,0.2) 0%, transparent 65%), radial-gradient(ellipse 50% 50% at 15% 85%, rgba(139,80,30,0.15) 0%, transparent 60%)'
          }} />
          {/* Subtle grain */}
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundSize: '200px 200px' }} />
          {/* Decorative serif letter */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 font-serif text-[18rem] font-light leading-none opacity-[0.04] text-amber-200 select-none pointer-events-none">B</div>
          {/* Horizontal lines pattern */}
          <div className="absolute left-0 top-0 w-px h-full opacity-10" style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(255,200,100,0.5) 40%, rgba(255,200,100,0.5) 60%, transparent 100%)' }} />

          <div className="relative">
            <Link to="/" className="font-serif text-3xl font-light text-amber-50 tracking-wider">
              NY Butik
            </Link>
            <div className="mt-4 h-px w-12 bg-amber-300/30" />
            <p className="mt-4 text-sm font-light text-amber-100/35 leading-relaxed max-w-xs">
              Modern tesettür giyimde zerafet ve kalite bir arada.
            </p>
          </div>
        </div>

        {/* Sağ panel — form */}
        <div className="flex flex-1 items-center justify-center px-6 py-16">
          <div className="w-full max-w-sm">
            {/* Mobile logo */}
            <div className="mb-10 lg:hidden text-center">
              <Link to="/" className="font-serif text-3xl font-light text-foreground tracking-wide">
                NY Butik
              </Link>
            </div>

            <h1 className="font-serif text-2xl font-light text-foreground mb-1">Giriş Yap</h1>
            <p className="text-sm text-muted-foreground mb-8">Hesabınıza erişin</p>

            <form onSubmit={handleSubmit((d) => login(d))} noValidate className="space-y-5">
              <div>
                <label htmlFor="email" className="input-label">E-posta</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="ornek@email.com"
                  className={cn('input', errors.email && 'border-destructive focus:ring-destructive/20')}
                  {...register('email')}
                />
                {errors.email && <p className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="input-label">Şifre</label>
                  <Link to="/sifremi-unuttum" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                    Şifremi unuttum
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={cn('input pr-10', errors.password && 'border-destructive focus:ring-destructive/20')}
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
                {errors.password && <p className="mt-1.5 text-xs text-destructive">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="btn-primary w-full justify-center py-3.5 mt-2"
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Giriş Yap
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Hesabınız yok mu?{' '}
              <Link to="/kayit" className="text-foreground underline underline-offset-4 hover:text-brand-earth transition-colors">
                Ücretsiz kaydolun
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
