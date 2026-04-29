import { api } from '@/api/axios'
import type { AuthUser } from '@/store/authStore'

interface LoginPayload {
  email:    string
  password: string
}

interface LoginResponse {
  accessToken: string
  user:         AuthUser
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<LoginResponse>('/auth/login', payload).then((r: { data: LoginResponse }) => r.data),

  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', payload).then((r: { data: unknown }) => r.data),
}