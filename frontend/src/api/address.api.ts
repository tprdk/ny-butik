import { apiClient } from '@/api/client'
import type { ApiResponse } from '@/types/api.types'

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
  createdAt: string
}

export interface AddressFormData {
  label?: string
  firstName: string
  lastName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  district: string
  postalCode: string
  isDefault: boolean
}

export const addressApi = {
  getAll: () =>
    apiClient
      .get<ApiResponse<Address[]>>('/users/me/addresses')
      .then((res) => res.data.data),

  create: (data: AddressFormData) =>
    apiClient
      .post<ApiResponse<Address>>('/users/me/addresses', data)
      .then((res) => res.data.data),

  update: (id: number, data: AddressFormData) =>
    apiClient
      .put<ApiResponse<Address>>(`/users/me/addresses/${id}`, data)
      .then((res) => res.data.data),

  remove: (id: number) =>
    apiClient.delete(`/users/me/addresses/${id}`),

  setDefault: (id: number) =>
    apiClient
      .patch<ApiResponse<Address>>(`/users/me/addresses/${id}/default`)
      .then((res) => res.data.data),
}
