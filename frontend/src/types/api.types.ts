export interface ApiResponse<T> {
  data: T
  timestamp: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface ApiError {
  type: string
  title: string
  status: number
  detail: string
  instance?: string
  errors?: FieldError[]
  traceId?: string
}

export interface FieldError {
  field: string
  message: string
}
