import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import type { UserRole } from '@/types/user.types'

interface Props {
  requiredRole: 'CUSTOMER' | 'ADMIN'
}

export default function ProtectedRoute({ requiredRole }: Props) {
  const { user, accessToken } = useAuthStore()
  const location = useLocation()

  if (!accessToken || !user) {
    return <Navigate to="/giris" state={{ from: location }} replace />
  }

  const roleHierarchy: Record<UserRole, number> = { GUEST: 0, CUSTOMER: 1, ADMIN: 2 }
  const required = roleHierarchy[requiredRole]
  const current = roleHierarchy[user.role]

  if (current < required) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
