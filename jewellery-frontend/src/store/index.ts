import { configureStore } from '@reduxjs/toolkit'
import uiReducer from './uiSlice'
import authReducer, { logout } from './authSlice'
import cartReducer from './cartSlice'
import { saveJSON } from '@/lib/storage'
import { AUTH_STORAGE_KEY, AUTH_UNAUTHORIZED_EVENT } from '@/lib/axios'

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    cart: cartReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Persist auth + cart to localStorage on every change (source of truth for
// guest cart UX and for restoring the session across reloads).
store.subscribe(() => {
  const state = store.getState()
  saveJSON(AUTH_STORAGE_KEY, { token: state.auth.token, user: state.auth.user })
  saveJSON('cart_items', state.cart.items)
})

// The axios layer can't import the store directly (it would create a
// require cycle with slices that call `api`), so it signals 401s via a
// window event instead; we translate that into a logout here.
if (typeof window !== 'undefined') {
  window.addEventListener(AUTH_UNAUTHORIZED_EVENT, () => {
    store.dispatch(logout())
  })
}
