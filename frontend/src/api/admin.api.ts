import { apiClient } from './client'
import type { AxiosResponse } from 'axios'
import type { ApiResponse, PageResponse } from '@/types/api.types'
import type { Product, ProductSummary } from '@/types/catalog.types'

const unwrap = <T>(res: AxiosResponse<ApiResponse<T>>): T => res.data.data

// ─── Products ──────────────────────────────────────────────────────────────

export interface AdminProductPayload {
  categoryId: number
  name: string
  shortDesc?: string
  description?: string
  featured?: boolean
  tags?: string[]
  attributes?: Record<string, string>
  variants?: {
    colorId?: number
    sizeId?: number
    sku: string
    price: number
    salePrice?: number
    stockQuantity?: number
    isActive?: boolean
  }[]
}

export const adminApi = {
  // Products
  getProducts: (params: {
    categoryId?: number
    search?: string
    status?: string
    page?: number
    size?: number
  }): Promise<PageResponse<ProductSummary>> => {
    const p = new URLSearchParams()
    if (params.categoryId) p.set('categoryId', String(params.categoryId))
    if (params.search) p.set('search', params.search)
    if (params.status) p.set('status', params.status)
    p.set('page', String(params.page ?? 0))
    p.set('size', String(params.size ?? 20))
    return apiClient
      .get<ApiResponse<PageResponse<ProductSummary>>>(`/admin/products?${p}`)
      .then(unwrap)
  },

  getProduct: (id: number): Promise<Product> =>
    apiClient.get<ApiResponse<Product>>(`/admin/products/${id}`).then(unwrap),

  createProduct: (payload: AdminProductPayload): Promise<Product> =>
    apiClient.post<ApiResponse<Product>>('/admin/products', payload).then(unwrap),

  updateProduct: (id: number, payload: AdminProductPayload): Promise<Product> =>
    apiClient.put<ApiResponse<Product>>(`/admin/products/${id}`, payload).then(unwrap),

  updateStatus: (id: number, status: string): Promise<Product> =>
    apiClient.patch<ApiResponse<Product>>(`/admin/products/${id}/status?status=${status}`).then(unwrap),

  deleteProduct: (id: number): Promise<void> =>
    apiClient.delete(`/admin/products/${id}`).then(() => undefined),

  // Images
  uploadImage: (productId: number, file: File, altText?: string): Promise<{ id: number; url: string; isPrimary: boolean; displayOrder: number }> => {
    const form = new FormData()
    form.append('file', file)
    if (altText) form.append('altText', altText)
    return apiClient
      .post<ApiResponse<{ id: number; url: string; isPrimary: boolean; displayOrder: number }>>(
        `/admin/products/${productId}/images`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      .then(unwrap)
  },

  deleteImage: (productId: number, imageId: number): Promise<void> =>
    apiClient.delete(`/admin/products/${productId}/images/${imageId}`).then(() => undefined),

  reorderImages: (productId: number, imageIds: number[]): Promise<void> =>
    apiClient.patch(`/admin/products/${productId}/images/order`, { imageIds }).then(() => undefined),

  setPrimaryImage: (productId: number, imageId: number): Promise<void> =>
    apiClient.patch(`/admin/products/${productId}/images/${imageId}/primary`).then(() => undefined),
}
