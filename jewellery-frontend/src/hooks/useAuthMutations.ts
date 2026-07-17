import { useMutation } from '@tanstack/react-query'
import { api, type ApiErrorShape } from '@/lib/axios'
import { useAppDispatch } from '@/store/hooks'
import { setCredentials } from '@/store/authSlice'
import { pushCartToServer } from '@/store/cartSlice'
import type { AuthResponse, LoginPayload, RegisterPayload } from '@/types/api'

function toCredentials(data: AuthResponse) {
  return {
    token: data.accessToken,
    user: { id: data.userId, email: data.email, fullName: data.fullName, roles: data.roles },
  }
}

export function useLogin() {
  const dispatch = useAppDispatch()
  return useMutation<AuthResponse, ApiErrorShape, LoginPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<AuthResponse>('/auth/login', payload)
      return data
    },
    onSuccess: (data) => {
      dispatch(setCredentials(toCredentials(data)))
      dispatch(pushCartToServer())
    },
  })
}

export function useRegister() {
  const dispatch = useAppDispatch()
  return useMutation<AuthResponse, ApiErrorShape, RegisterPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<AuthResponse>('/auth/register', payload)
      return data
    },
    onSuccess: (data) => {
      dispatch(setCredentials(toCredentials(data)))
      dispatch(pushCartToServer())
    },
  })
}
