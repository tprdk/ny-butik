import { useQuery } from '@tanstack/react-query'
import { catalogApi } from '@/api/catalog.api'
import type { ProductFilter } from '@/types/catalog.types'

export const CATALOG_KEYS = {
  all: ['catalog'] as const,
  categories: () => [...CATALOG_KEYS.all, 'categories'] as const,
  colors: () => [...CATALOG_KEYS.all, 'colors'] as const,
  sizes: () => [...CATALOG_KEYS.all, 'sizes'] as const,
  products: (filter: ProductFilter) => [...CATALOG_KEYS.all, 'products', filter] as const,
  product: (slug: string) => [...CATALOG_KEYS.all, 'product', slug] as const,
  featured: (size: number) => [...CATALOG_KEYS.all, 'featured', size] as const,
}

export function useCategories() {
  return useQuery({
    queryKey: CATALOG_KEYS.categories(),
    queryFn: catalogApi.getCategories,
    staleTime: 10 * 60 * 1000,
  })
}

export function useColors() {
  return useQuery({
    queryKey: CATALOG_KEYS.colors(),
    queryFn: catalogApi.getColors,
    staleTime: 60 * 60 * 1000,
  })
}

export function useSizes() {
  return useQuery({
    queryKey: CATALOG_KEYS.sizes(),
    queryFn: catalogApi.getSizes,
    staleTime: 60 * 60 * 1000,
  })
}

export function useProducts(filter: ProductFilter = {}) {
  return useQuery({
    queryKey: CATALOG_KEYS.products(filter),
    queryFn: () => catalogApi.getProducts(filter),
    staleTime: 5 * 60 * 1000,
  })
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: CATALOG_KEYS.product(slug),
    queryFn: () => catalogApi.getProductBySlug(slug),
    staleTime: 5 * 60 * 1000,
    enabled: !!slug,
  })
}

export function useFeaturedProducts(size = 8) {
  return useQuery({
    queryKey: CATALOG_KEYS.featured(size),
    queryFn: () => catalogApi.getFeatured(size),
    staleTime: 5 * 60 * 1000,
  })
}
