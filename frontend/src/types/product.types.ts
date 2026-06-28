export interface Category {
  id: number
  name: string
  slug: string
  parentId: number | null
  imageUrl: string | null
  children?: Category[]
}

export interface Color {
  id: number
  name: string
  hexCode: string | null
  slug: string
}

export interface Size {
  id: number
  name: string
  sizeGroup: 'ALPHA' | 'NUMERIC'
  sortOrder: number
}

export interface ProductVariant {
  id: number
  sku: string
  color: Color | null
  size: Size | null
  price: number
  salePrice: number | null
  stockQuantity: number
  isActive: boolean
}

export interface ProductImage {
  id: number
  url: string
  altText: string | null
  displayOrder: number
  isPrimary: boolean
  variantId: number | null
}

export interface Product {
  id: number
  name: string
  slug: string
  shortDesc: string | null
  description: string | null
  category: Pick<Category, 'id' | 'name' | 'slug'>
  tags: string[]
  attributes: { key: string; value: string }[]
  variants: ProductVariant[]
  images: ProductImage[]
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED'
  featured: boolean
  primaryImage: string | null
  minPrice: number
  maxPrice: number
  hasDiscount: boolean
}

export interface ProductListItem {
  id: number
  name: string
  slug: string
  shortDesc: string | null
  primaryImage: string | null
  minPrice: number
  maxPrice: number
  hasDiscount: boolean
  minSalePrice: number | null
  inStock: boolean
  category: Pick<Category, 'id' | 'name' | 'slug'>
  tags: string[]
}

export interface ProductFilters {
  category?: string
  color?: number[]
  size?: number[]
  minPrice?: number
  maxPrice?: number
  onSale?: boolean
  tag?: string
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular'
  page?: number
  size_page?: number
}
