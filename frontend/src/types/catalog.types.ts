export interface Color {
  id: number
  name: string
  hexCode: string
  slug: string
}

export interface Size {
  id: number
  name: string
  sizeGroup: string
  sortOrder: number
}

export interface Category {
  id: number
  parentId: number | null
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  displayOrder: number
  isActive: boolean
  children: Category[]
}

export interface ProductVariant {
  id: number
  color: Color | null
  size: Size | null
  sku: string
  price: number
  salePrice: number | null
  effectivePrice: number
  stockQuantity: number
  isActive: boolean
  inStock: boolean
}

export interface ProductImage {
  id: number
  url: string
  altText: string | null
  displayOrder: number
  isPrimary: boolean
}

export interface ProductAttribute {
  attrKey: string
  attrValue: string
  displayOrder: number
}

export interface ProductSummary {
  id: number
  name: string
  slug: string
  shortDesc: string | null
  status: string
  featured: boolean
  primaryImageUrl: string | null
  minPrice: number | null
  maxPrice: number | null
  minSalePrice: number | null
  inStock: boolean
  category: Category
  createdAt: string
}

export interface Product {
  id: number
  name: string
  slug: string
  shortDesc: string | null
  description: string | null
  status: string
  featured: boolean
  category: Category
  variants: ProductVariant[]
  images: ProductImage[]
  tags: string[]
  attributes: ProductAttribute[]
  createdAt: string
  updatedAt: string
}

export interface ProductFilter {
  categoryId?: number
  colorIds?: number[]
  sizeIds?: number[]
  minPrice?: number
  maxPrice?: number
  search?: string
  featured?: boolean
  page?: number
  size?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}
