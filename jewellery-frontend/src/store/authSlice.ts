import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { loadJSON } from '@/lib/storage'
import { AUTH_STORAGE_KEY } from '@/lib/axios'
import type { AuthUser } from '@/types/api'

export interface AuthState {
  token: string | null
  user: AuthUser | null
}

const persisted = loadJSON<AuthState>(AUTH_STORAGE_KEY, { token: null, user: null })

const initialState: AuthState = {
  token: persisted.token ?? null,
  user: persisted.user ?? null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; user: AuthUser }>) {
      state.token = action.payload.token
      state.user = action.payload.user
    },
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload
    },
    logout(state) {
      state.token = null
      state.user = null
    },
  },
})

export const { setCredentials, setUser, logout } = authSlice.actions
export default authSlice.reducer
