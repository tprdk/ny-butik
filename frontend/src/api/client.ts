import axios, { AxiosError } from 'axios'
import { useAuthStore } from '@/store/auth.store'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  withCredentials: true,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (token ? p.resolve(token) : p.reject(error)))
  failedQueue = []
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest?._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              if (originalRequest) {
                originalRequest.headers!.Authorization = `Bearer ${token}`
                resolve(apiClient(originalRequest))
              }
            },
            reject,
          })
        })
      }

      originalRequest!._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post<{ data: { accessToken: string } }>(
          `${import.meta.env.VITE_API_URL ?? '/api/v1'}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        const newToken = data.data.accessToken
        useAuthStore.getState().setAccessToken(newToken)
        processQueue(null, newToken)
        originalRequest!.headers!.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest!)
      } catch (refreshError) {
        processQueue(refreshError, null)
        useAuthStore.getState().clearAuth()
        window.location.href = '/giris'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
