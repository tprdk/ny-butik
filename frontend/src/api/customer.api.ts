import { apiClient } from './client'
import type { AxiosResponse } from 'axios'
import type { ApiResponse, PageResponse } from '@/types/api.types'

const unwrap = <T>(res: AxiosResponse<ApiResponse<T>>): T => res.data.data

export interface CustomerSummary {
  id: number
  email: string
  firstName: string
  lastName: string
  isActive: boolean
  createdAt: string
}

export interface CustomerDetail extends CustomerSummary {
  role: string
  orderCount: number
  totalSpent: number
}

export const customerApi = {
  list: (page = 0, size = 20): Promise<PageResponse<CustomerSummary>> =>
    apiClient
      .get<ApiResponse<PageResponse<CustomerSummary>>>(`/admin/customers?page=${page}&size=${size}`)
      .then(unwrap),

  get: (id: number): Promise<CustomerDetail> =>
    apiClient.get<ApiResponse<CustomerDetail>>(`/admin/customers/${id}`).then(unwrap),

  toggleActive: (id: number): Promise<CustomerDetail> =>
    apiClient.patch<ApiResponse<CustomerDetail>>(`/admin/customers/${id}/toggle-active`).then(unwrap),
}
