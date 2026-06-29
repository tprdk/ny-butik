import { apiClient } from './client'
import type { AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types/api.types'
import type { AddItemRequest, Cart, UpdateItemRequest } from '@/types/cart.types'

const unwrap = <T>(res: AxiosResponse<ApiResponse<T>>): T => res.data.data

const sessionHeader = (sessionId?: string | null) =>
  sessionId ? { 'X-Session-Id': sessionId } : {}

export const cartApi = {
  get: (sessionId?: string | null): Promise<Cart> =>
    apiClient.get<ApiResponse<Cart>>('/cart', { headers: sessionHeader(sessionId) }).then(unwrap),

  addItem: (req: AddItemRequest, sessionId?: string | null): Promise<Cart> =>
    apiClient.post<ApiResponse<Cart>>('/cart/items', req, { headers: sessionHeader(sessionId) }).then(unwrap),

  updateItem: (variantId: number, req: UpdateItemRequest, sessionId?: string | null): Promise<Cart> =>
    apiClient.put<ApiResponse<Cart>>(`/cart/items/${variantId}`, req, { headers: sessionHeader(sessionId) }).then(unwrap),

  removeItem: (variantId: number, sessionId?: string | null): Promise<Cart> =>
    apiClient.delete<ApiResponse<Cart>>(`/cart/items/${variantId}`, { headers: sessionHeader(sessionId) }).then(unwrap),

  clear: (sessionId?: string | null): Promise<Cart> =>
    apiClient.delete<ApiResponse<Cart>>('/cart', { headers: sessionHeader(sessionId) }).then(unwrap),

  applyCoupon: (code: string, sessionId?: string | null): Promise<Cart> =>
    apiClient.post<ApiResponse<Cart>>('/cart/coupon', { code }, { headers: sessionHeader(sessionId) }).then(unwrap),

  removeCoupon: (sessionId?: string | null): Promise<Cart> =>
    apiClient.delete<ApiResponse<Cart>>('/cart/coupon', { headers: sessionHeader(sessionId) }).then(unwrap),

  merge: (sessionId: string): Promise<Cart> =>
    apiClient.post<ApiResponse<Cart>>('/cart/merge', {}, { headers: { 'X-Session-Id': sessionId } }).then(unwrap),
}
