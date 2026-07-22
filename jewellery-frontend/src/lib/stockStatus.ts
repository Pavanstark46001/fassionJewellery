import type { StockStatus } from '@/types/admin'

export const STOCK_LABELS: Record<StockStatus, string> = {
  IN_STOCK: 'In Stock',
  LOW_STOCK: 'Low Stock',
  OUT_OF_STOCK: 'Out of Stock',
  COMING_SOON: 'Coming Soon',
}

export const STOCK_VARIANTS: Record<StockStatus, 'success' | 'gold' | 'danger' | 'muted'> = {
  IN_STOCK: 'success',
  LOW_STOCK: 'gold',
  OUT_OF_STOCK: 'danger',
  COMING_SOON: 'muted',
}
