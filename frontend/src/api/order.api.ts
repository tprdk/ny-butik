import { apiClient } from './client'
import type { AxiosResponse } from 'axios'
import type { ApiResponse, PageResponse } from '@/types/api.types'
import type { Order, OrderSummary, CreateOrderRequest, CheckoutResponse, Address } from '@/types/order.types'

const unwrap = <T>(res: AxiosResponse<ApiResponse<T>>): T => res.data.data

export const orderApi = {
  getMyOrders: (page = 0, size = 10): Promise<PageResponse<OrderSummary>> =>
    apiClient
      .get<ApiResponse<PageResponse<OrderSummary>>>(`/orders?page=${page}&size=${size}`)
      .then(unwrap),

  getMyOrder: (orderNumber: string): Promise<Order> =>
    apiClient.get<ApiResponse<Order>>(`/orders/${orderNumber}`).then(unwrap),

  createOrder: (req: CreateOrderRequest): Promise<CheckoutResponse> =>
    apiClient.post<ApiResponse<CheckoutResponse>>('/orders', req).then(unwrap),

  cancelOrder: (orderNumber: string): Promise<Order> =>
    apiClient.post<ApiResponse<Order>>(`/orders/${orderNumber}/cancel`).then(unwrap),

  getAddresses: (): Promise<Address[]> =>
    apiClient.get<ApiResponse<Address[]>>('/users/me/addresses').then(unwrap),

  // Admin
  adminGetOrders: (status?: string, page = 0, size = 20): Promise<PageResponse<OrderSummary>> => {
    const p = new URLSearchParams()
    if (status) p.set('status', status)
    p.set('page', String(page))
    p.set('size', String(size))
    return apiClient
      .get<ApiResponse<PageResponse<OrderSummary>>>(`/admin/orders?${p}`)
      .then(unwrap)
  },

  adminGetOrder: (id: number): Promise<Order> =>
    apiClient.get<ApiResponse<Order>>(`/admin/orders/${id}`).then(unwrap),

  adminUpdateStatus: (id: number, status: string, note?: string): Promise<Order> =>
    apiClient
      .patch<ApiResponse<Order>>(`/admin/orders/${id}/status`, { status, note })
      .then(unwrap),
}
