import { apiClient } from './client'
import type { AxiosResponse } from 'axios'
import type { ApiResponse, PageResponse } from '@/types/api.types'

const unwrap = <T>(res: AxiosResponse<ApiResponse<T>>): T => res.data.data

export type ReturnStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'RECEIVED' | 'REFUNDED'
export type ReturnReason = 'WRONG_SIZE' | 'WRONG_PRODUCT' | 'DEFECTIVE' | 'CHANGED_MIND' | 'OTHER'

export interface ReturnItemRequest {
  orderItemId: number
  quantity: number
}

export interface CreateReturnPayload {
  orderId: number
  reason: ReturnReason
  description?: string
  items: ReturnItemRequest[]
}

export interface ReturnSummary {
  id: number
  orderId: number
  orderNumber: string
  status: ReturnStatus
  reason: ReturnReason
  itemCount: number
  refundAmount: number | null
  createdAt: string
}

export interface ReturnItemDetail {
  id: number
  orderItemId: number
  productName: string
  sku: string
  quantity: number
}

export interface ReturnDetail {
  id: number
  orderId: number
  orderNumber: string
  status: ReturnStatus
  reason: ReturnReason
  description: string | null
  adminNote: string | null
  returnTracking: string | null
  refundAmount: number | null
  items: ReturnItemDetail[]
  createdAt: string
  updatedAt: string
}

export interface AdminUpdateReturnPayload {
  status: ReturnStatus
  adminNote?: string
  returnTracking?: string
  refundAmount?: number
}

export const returnApi = {
  getMyReturns: (page = 0, size = 10): Promise<PageResponse<ReturnSummary>> =>
    apiClient
      .get<ApiResponse<PageResponse<ReturnSummary>>>(`/returns?page=${page}&size=${size}`)
      .then(unwrap),

  getMyReturn: (id: number): Promise<ReturnDetail> =>
    apiClient.get<ApiResponse<ReturnDetail>>(`/returns/${id}`).then(unwrap),

  create: (payload: CreateReturnPayload): Promise<ReturnDetail> =>
    apiClient.post<ApiResponse<ReturnDetail>>('/returns', payload).then(unwrap),

  adminList: (status?: ReturnStatus, page = 0, size = 20): Promise<PageResponse<ReturnSummary>> => {
    const params = new URLSearchParams({ page: String(page), size: String(size) })
    if (status) params.set('status', status)
    return apiClient
      .get<ApiResponse<PageResponse<ReturnSummary>>>(`/admin/returns?${params}`)
      .then(unwrap)
  },

  adminGet: (id: number): Promise<ReturnDetail> =>
    apiClient.get<ApiResponse<ReturnDetail>>(`/admin/returns/${id}`).then(unwrap),

  adminUpdate: (id: number, payload: AdminUpdateReturnPayload): Promise<ReturnDetail> =>
    apiClient.patch<ApiResponse<ReturnDetail>>(`/admin/returns/${id}`, payload).then(unwrap),
}
