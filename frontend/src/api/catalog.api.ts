import { apiClient } from './client'
import type { AxiosResponse } from 'axios'
import type { Category, Color, Product, ProductFilter, ProductSummary, Size } from '@/types/catalog.types'
import type { ApiResponse, PageResponse } from '@/types/api.types'

const unwrap = <T>(res: AxiosResponse<ApiResponse<T>>): T => res.data.data

export const catalogApi = {
  getCategories: (): Promise<Category[]> =>
    apiClient.get<ApiResponse<Category[]>>('/categories').then(unwrap),

  getCategoryBySlug: (slug: string): Promise<Category> =>
    apiClient.get<ApiResponse<Category>>(`/categories/${slug}`).then(unwrap),

  getColors: (): Promise<Color[]> =>
    apiClient.get<ApiResponse<Color[]>>('/colors').then(unwrap),

  getSizes: (): Promise<Size[]> =>
    apiClient.get<ApiResponse<Size[]>>('/sizes').then(unwrap),

  getProducts: (filter: ProductFilter = {}): Promise<PageResponse<ProductSummary>> => {
    const params = new URLSearchParams()
    if (filter.categoryId) params.set('categoryId', String(filter.categoryId))
    if (filter.colorIds?.length) filter.colorIds.forEach((id) => params.append('colorIds', String(id)))
    if (filter.sizeIds?.length) filter.sizeIds.forEach((id) => params.append('sizeIds', String(id)))
    if (filter.minPrice != null) params.set('minPrice', String(filter.minPrice))
    if (filter.maxPrice != null) params.set('maxPrice', String(filter.maxPrice))
    if (filter.search) params.set('search', filter.search)
    if (filter.featured != null) params.set('featured', String(filter.featured))
    params.set('page', String(filter.page ?? 0))
    params.set('size', String(filter.size ?? 20))
    params.set('sortBy', filter.sortBy ?? 'createdAt')
    params.set('sortDir', filter.sortDir ?? 'desc')
    return apiClient
      .get<ApiResponse<PageResponse<ProductSummary>>>(`/products?${params}`)
      .then(unwrap)
  },

  getFeatured: (size = 8): Promise<PageResponse<ProductSummary>> =>
    apiClient
      .get<ApiResponse<PageResponse<ProductSummary>>>(`/products/featured?size=${size}`)
      .then(unwrap),

  getProductBySlug: (slug: string): Promise<Product> =>
    apiClient.get<ApiResponse<Product>>(`/products/${slug}`).then(unwrap),
}
