import { useEffect } from 'react'
import axios from 'axios'
import { useAuthStore } from '@/store/auth.store'

export function useAuthInit() {
  const { user, accessToken, setAccessToken, clearAuth, initialized, setInitialized } = useAuthStore()

  useEffect(() => {
    if (initialized) return

    if (user && !accessToken) {
      // Cookie'deki refresh token ile sessizce yeni access token al
      axios
        .post<{ data: { accessToken: string } }>(
          '/api/v1/auth/refresh',
          {},
          { withCredentials: true }
        )
        .then((res) => setAccessToken(res.data.data.accessToken))
        .catch(() => clearAuth())
        .finally(() => setInitialized(true))
    } else {
      setInitialized(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return initialized
}
