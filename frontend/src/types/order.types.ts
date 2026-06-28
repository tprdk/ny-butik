export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_PROCESSING'
  | 'PAYMENT_FAILED'
  | 'PAID'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'

export type ReturnStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'RETURN_RECEIVED'
  | 'REFUNDED'

export interface OrderItem {
  id: number
  variantId: number
  productName: string
  sku: string
  colorName: string | null
  sizeName: string | null
  imageUrl: string | null
  quantity: number
  unitPrice: number
  salePrice: number | null
  lineTotal: number
}

export interface Shipment {
  trackingNumber: string | null
  trackingUrl: string | null
  status: string
  estimatedDelivery: string | null
  deliveredAt: string | null
}

export interface Order {
  id: number
  orderNumber: string
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  discountAmount: number
  shippingAmount: number
  taxAmount: number
  totalAmount: number
  shipment: Shipment | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface OrderSummary {
  id: number
  orderNumber: string
  status: OrderStatus
  totalAmount: number
  itemCount: number
  primaryImage: string | null
  createdAt: string
}
