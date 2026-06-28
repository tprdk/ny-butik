export type UserRole = 'GUEST' | 'CUSTOMER' | 'ADMIN'

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  phone: string | null
  role: UserRole
  emailVerified: boolean
}

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
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
}
