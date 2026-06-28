import { apiClient } from './client'
import type { ApiResponse } from '@/types/api.types'
import type { User } from '@/types/user.types'

export interface AuthResponse {
  accessToken: string
  expiresIn: number
  user: User
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export const authApi = {
  register: (data: RegisterPayload) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data).then((r) => r.data.data),

  login: (data: LoginPayload) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data).then((r) => r.data.data),

  refresh: () =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh').then((r) => r.data.data),

  logout: () => apiClient.post('/auth/logout'),
}
