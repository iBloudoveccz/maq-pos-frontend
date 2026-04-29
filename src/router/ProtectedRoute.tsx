import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { AuthStore } from '@/store/authStore'

export function ProtectedRoute() {
  const token = useAuthStore((s: AuthStore) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <Outlet />
}