export interface CartItem {
  variantId: number
  productId: number
  productName: string
  productSlug: string
  imageUrl: string | null
  sku: string
  colorName: string | null
  sizeName: string | null
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface CouponInfo {
  id: number
  code: string
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT'
  discountValue: number
  minOrderAmount: number | null
}

export interface Cart {
  id: number | null
  items: CartItem[]
  subtotal: number
  discountAmount: number
  shippingAmount: number
  total: number
  coupon: CouponInfo | null
}

export interface AddItemRequest {
  variantId: number
  quantity: number
}

export interface UpdateItemRequest {
  quantity: number
}
