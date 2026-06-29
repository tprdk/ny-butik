export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_PROCESSING'
  | 'PAYMENT_FAILED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED'

export type ShipmentStatus =
  | 'CREATED'
  | 'PICKING'
  | 'PACKED'
  | 'SHIPPED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'RETURNED'

export interface OrderItem {
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

export interface ShipmentInfo {
  id: number
  provider: string
  trackingNumber: string | null
  trackingUrl: string | null
  status: ShipmentStatus
  estimatedDelivery: string | null
  deliveredAt: string | null
}

export interface StatusHistory {
  id: number
  status: OrderStatus
  note: string | null
  changedBy: string | null
  createdAt: string
}

export interface Order {
  id: number
  orderNumber: string
  status: OrderStatus
  subtotal: number
  discountAmount: number
  shippingAmount: number
  taxAmount: number
  totalAmount: number
  notes: string | null
  couponCode: string | null
  items: OrderItem[]
  statusHistory: StatusHistory[]
  shipment: ShipmentInfo | null
  shippingName: string
  shippingPhone: string
  shippingAddress1: string
  shippingAddress2: string | null
  shippingCity: string
  shippingDistrict: string
  shippingPostal: string
  shippingCountry: string
  billingName: string
  billingAddress1: string
  billingCity: string
  billingDistrict: string
  createdAt: string
}

export interface OrderSummary {
  id: number
  orderNumber: string
  status: OrderStatus
  totalAmount: number
  itemCount: number
  shipmentStatus: ShipmentStatus | null
  createdAt: string
}

export interface CheckoutResponse {
  orderId: number
  orderNumber: string
  status: string
  total: number
}

export interface CreateOrderRequest {
  shippingAddressId: number
  billingAddressId: number
  paymentMethod: string
  notes?: string
}

export interface Address {
  id: number
  label: string | null
  firstName: string
  lastName: string
  phone: string
  addressLine1: string
  addressLine2: string | null
  city: string
  district: string
  postalCode: string
  country: string
  isDefault: boolean
}
