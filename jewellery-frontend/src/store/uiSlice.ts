import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CursorVariant } from '@/types/domain'

interface UiState {
  cursorVariant: CursorVariant
  isMobileNavOpen: boolean
  hasPreloaded: boolean
  isHeaderSolid: boolean
}

const initialState: UiState = {
  cursorVariant: 'default',
  isMobileNavOpen: false,
  hasPreloaded: false,
  isHeaderSolid: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCursorVariant(state, action: PayloadAction<CursorVariant>) {
      state.cursorVariant = action.payload
    },
    toggleMobileNav(state) {
      state.isMobileNavOpen = !state.isMobileNavOpen
    },
    setMobileNavOpen(state, action: PayloadAction<boolean>) {
      state.isMobileNavOpen = action.payload
    },
    setHasPreloaded(state, action: PayloadAction<boolean>) {
      state.hasPreloaded = action.payload
    },
    setHeaderSolid(state, action: PayloadAction<boolean>) {
      state.isHeaderSolid = action.payload
    },
  },
})

export const {
  setCursorVariant,
  toggleMobileNav,
  setMobileNavOpen,
  setHasPreloaded,
  setHeaderSolid,
} = uiSlice.actions

export default uiSlice.reducer
