import { z } from 'zod'

export const addressSchema = z.object({
  label: z.string().max(50).optional(),
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır.').max(100),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır.').max(100),
  phone: z
    .string()
    .min(1, 'Telefon numarası zorunludur.')
    .regex(/^(\+90|0)?[0-9]{10}$/, 'Geçerli bir telefon numarası giriniz. (Örn: 05XX XXX XX XX)'),
  addressLine1: z.string().min(5, 'Adres en az 5 karakter olmalıdır.').max(255),
  addressLine2: z.string().max(255).optional(),
  city: z.string().min(2, 'Şehir zorunludur.').max(100),
  district: z.string().min(2, 'İlçe zorunludur.').max(100),
  postalCode: z
    .string()
    .min(1, 'Posta kodu zorunludur.')
    .regex(/^\d{5}$/, 'Posta kodu 5 haneli olmalıdır.'),
  isDefault: z.boolean(),
})

export type AddressFormValues = z.infer<typeof addressSchema>
