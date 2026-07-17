import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout as logoutAction } from '@/store/authSlice'

/** Selector/dispatch bundle for "is logged in" / current user / logout. */
export function useAuth() {
  const token = useAppSelector((state) => state.auth.token)
  const user = useAppSelector((state) => state.auth.user)
  const dispatch = useAppDispatch()

  return {
    token,
    user,
    isAuthenticated: Boolean(token),
    isAdmin: Boolean(user?.roles?.includes('ADMIN')),
    logout: () => dispatch(logoutAction()),
  }
}
