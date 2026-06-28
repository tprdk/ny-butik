import { useMutation } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/store/auth.store'
import type { LoginFormData, RegisterFormData } from '@/schemas/auth.schema'

export function useLogin() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  return useMutation({
    mutationFn: (data: LoginFormData) => authApi.login(data),
    onSuccess: (res) => {
      setAuth(res.user, res.accessToken)
      toast.success('Hoş geldiniz, ' + res.user.firstName + '!')
      navigate(from, { replace: true })
    },
    onError: () => {
      toast.error('E-posta veya şifre hatalı.')
    },
  })
}

export function useRegister() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: RegisterFormData) =>
      authApi.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      }),
    onSuccess: (res) => {
      setAuth(res.user, res.accessToken)
      toast.success('Kayıt başarılı! Hoş geldiniz.')
      navigate('/', { replace: true })
    },
    onError: (error: any) => {
      const detail = error?.response?.data?.detail
      toast.error(detail ?? 'Kayıt sırasında bir hata oluştu.')
    },
  })
}

export function useLogout() {
  const { clearAuth } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearAuth()
      navigate('/giris', { replace: true })
      toast.success('Çıkış yapıldı.')
    },
  })
}
