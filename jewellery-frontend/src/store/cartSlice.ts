import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { loadJSON } from '@/lib/storage'
import { api } from '@/lib/axios'
import type { Product } from '@/types/api'
import type { AppDispatch, RootState } from './index'

export interface CartLineItem {
  productId: string
  product: Product
  quantity: number
}

interface CartState {
  items: CartLineItem[]
}

const initialState: CartState = {
  items: loadJSON<CartLineItem[]>('cart_items', []),
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems(state, action: PayloadAction<CartLineItem[]>) {
      state.items = action.payload
    },
    addItemLocal(state, action: PayloadAction<{ product: Product; quantity: number }>) {
      const { product, quantity } = action.payload
      const existing = state.items.find((item) => item.productId === product.id)
      if (existing) {
        existing.quantity += quantity
      } else {
        state.items.push({ productId: product.id, product, quantity })
      }
    },
    updateQuantityLocal(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const item = state.items.find((i) => i.productId === action.payload.productId)
      if (item) item.quantity = Math.max(1, action.payload.quantity)
    },
    removeItemLocal(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.productId !== action.payload)
    },
    clearCartLocal(state) {
      state.items = []
    },
  },
})

export const { setCartItems, addItemLocal, updateQuantityLocal, removeItemLocal, clearCartLocal } =
  cartSlice.actions
export default cartSlice.reducer

/* ---------------------------- Selectors ---------------------------- */

export const selectCartItems = (state: RootState) => state.cart.items

export const selectCartItemCount = (state: RootState) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0)

export const selectCartSubtotal = (state: RootState) =>
  state.cart.items.reduce(
    (sum, item) => sum + (item.product.discountedPrice ?? item.product.basePrice) * item.quantity,
    0,
  )

/* ------------------------------ Thunks ------------------------------ */
/**
 * Cart is Redux + localStorage as the source of truth for instant, no-login
 * UX. When the user is authenticated we additionally fire-and-forget the
 * matching backend call so the server cart stays roughly in sync — failures
 * are swallowed since the local cart already reflects the user's intent.
 */

export function addToCart(product: Product, quantity = 1) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(addItemLocal({ product, quantity }))
    if (getState().auth.token) {
      api.post('/cart/items', { productId: product.id, quantity }).catch(() => {})
    }
  }
}

export function updateCartQuantity(productId: string, quantity: number) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(updateQuantityLocal({ productId, quantity }))
    if (getState().auth.token) {
      api.patch(`/cart/items/${productId}`, { quantity }).catch(() => {})
    }
  }
}

export function removeFromCart(productId: string) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(removeItemLocal(productId))
    if (getState().auth.token) {
      api.delete(`/cart/items/${productId}`).catch(() => {})
    }
  }
}

export function clearCart() {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(clearCartLocal())
    if (getState().auth.token) {
      api.delete('/cart').catch(() => {})
    }
  }
}

/** Push the local cart to the server after login — "prefer local, push on login". */
export function pushCartToServer() {
  return (_dispatch: AppDispatch, getState: () => RootState) => {
    const { token } = getState().auth
    const { items } = getState().cart
    if (!token || items.length === 0) return
    for (const item of items) {
      api.post('/cart/items', { productId: item.productId, quantity: item.quantity }).catch(() => {})
    }
  }
}
