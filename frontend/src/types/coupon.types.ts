export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT'

export interface Coupon {
  id: number
  code: string
  discountType: DiscountType
  discountValue: number
  minOrderAmount: number | null
  maxUses: number | null
  usesPerUser: number
  usedCount: number
  isActive: boolean
  startsAt: string | null
  expiresAt: string | null
}

export interface CreateCouponPayload {
  code: string
  discountType: DiscountType
  discountValue: number
  minOrderAmount?: number | null
  maxUses?: number | null
  usesPerUser?: number
  startsAt?: string | null
  expiresAt?: string | null
}
