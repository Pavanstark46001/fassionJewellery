import { Badge, type BadgeProps } from '@/components/ui/badge'
import type { OrderStatus } from '@/types/api'

const STATUS_VARIANTS: Record<OrderStatus, BadgeProps['variant']> = {
  PLACED: 'gold',
  CONFIRMED: 'outline',
  SHIPPED: 'dark',
  DELIVERED: 'success',
  CANCELLED: 'danger',
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PLACED: 'Placed',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant={STATUS_VARIANTS[status] ?? 'muted'} size="pill">
      {STATUS_LABELS[status] ?? status}
    </Badge>
  )
}
