import { z } from 'zod'

export const checkoutSchema = z.object({
  shippingAddressId: z.number({ required_error: 'Teslimat adresi seçin' }),
  billingAddressId: z.number({ required_error: 'Fatura adresi seçin' }),
  paymentMethod: z.string().default('MOCK'),
  notes: z.string().optional(),
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>
