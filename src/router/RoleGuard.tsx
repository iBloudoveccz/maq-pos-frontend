import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { AuthStore } from '@/store/authStore'

interface Props {
  allowedRoles: string[]
}

export function RoleGuard({ allowedRoles }: Props) {
  const user = useAuthStore((s: AuthStore) => s.user)
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}