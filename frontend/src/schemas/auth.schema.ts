import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
  password: z.string().min(1, 'Şifre boş olamaz.'),
})

export const registerSchema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır.').max(100),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır.').max(100),
  email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
  password: z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalıdır.')
    .regex(/[A-Z]/, 'En az bir büyük harf içermelidir.')
    .regex(/[a-z]/, 'En az bir küçük harf içermelidir.')
    .regex(/\d/, 'En az bir rakam içermelidir.'),
  passwordConfirm: z.string(),
}).refine((d) => d.password === d.passwordConfirm, {
  message: 'Şifreler eşleşmiyor.',
  path: ['passwordConfirm'],
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre boş olamaz.'),
  newPassword: z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalıdır.')
    .regex(/[A-Z]/, 'En az bir büyük harf.')
    .regex(/[a-z]/, 'En az bir küçük harf.')
    .regex(/\d/, 'En az bir rakam.'),
  newPasswordConfirm: z.string(),
}).refine((d) => d.newPassword === d.newPasswordConfirm, {
  message: 'Şifreler eşleşmiyor.',
  path: ['newPasswordConfirm'],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
