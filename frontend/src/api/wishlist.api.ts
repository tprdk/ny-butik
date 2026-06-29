import { apiClient } from '@/api/client'
import type { ApiResponse } from '@/types/api.types'

export interface WishlistItem {
  wishlistId: number
  productId: number
  productName: string
  slug: string
  imageUrl: string | null
  minPrice: number
  minSalePrice: number | null
  inStock: boolean
  addedAt: string
}

export const wishlistApi = {
  getAll: () =>
    apiClient
      .get<ApiResponse<WishlistItem[]>>('/wishlist')
      .then((res) => res.data.data),

  getIds: () =>
    apiClient
      .get<ApiResponse<number[]>>('/wishlist/ids')
      .then((res) => res.data.data),

  add: (productId: number) =>
    apiClient
      .post<ApiResponse<WishlistItem>>(`/wishlist/${productId}`)
      .then((res) => res.data.data),

  remove: (productId: number) =>
    apiClient.delete(`/wishlist/${productId}`),
}
