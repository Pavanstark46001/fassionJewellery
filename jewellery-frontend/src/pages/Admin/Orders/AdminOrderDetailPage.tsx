import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAdminOrder, useUpdateAdminOrderStatus } from '@/hooks/admin/useAdminOrders'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { OrderStatusBadge } from '@/pages/Orders/OrderStatusBadge'
import { formatDate, formatPaymentMethod, formatPrice } from '@/lib/utils'
import type { OrderStatus } from '@/types/api'

const STATUS_SEQUENCE: OrderStatus[] = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED']

const STATUS_LABELS: Record<OrderStatus, string> = {
  PLACED: 'Placed',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

function nextStatus(current: OrderStatus): OrderStatus | null {
  const idx = STATUS_SEQUENCE.indexOf(current)
  if (idx === -1 || idx === STATUS_SEQUENCE.length - 1) return null
  return STATUS_SEQUENCE[idx + 1]
}

export default function AdminOrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const { data: order, isLoading, isError } = useAdminOrder(orderNumber)
  const updateStatus = useUpdateAdminOrderStatus()
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('')

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm text-ink/60">Could not find this order.</p>
        <Link to="/admin/orders" className="text-sm text-gold-dark underline underline-offset-4">
          Back to Orders
        </Link>
      </div>
    )
  }

  const upcoming = nextStatus(order.status)
  const address = order.shippingAddress

  function handleUpdateStatus() {
    if (!orderNumber || !selectedStatus) return
    updateStatus.mutate(
      { orderNumber, status: selectedStatus },
      {
        onSuccess: () => {
          toast.success(`Order marked as ${STATUS_LABELS[selectedStatus as OrderStatus]}.`)
          setSelectedStatus('')
        },
        onError: (error) => toast.error(error?.message ?? 'Could not update the order status.'),
      },
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-ink/50">
          <Link to="/admin/orders" className="text-gold-dark underline underline-offset-4">
            Orders
          </Link>{' '}
          / {order.orderNumber}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-ink">{order.orderNumber}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="mt-1 text-sm text-ink/50">Placed on {formatDate(order.placedAt)}</p>
      </div>

      <div className="rounded-lg border border-black/10 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/60">Update Status</h2>
        {upcoming ? (
          <div className="mt-3 flex items-center gap-3">
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
              className="max-w-xs"
            >
              <option value="">Select next status…</option>
              <option value={upcoming}>{STATUS_LABELS[upcoming]}</option>
            </Select>
            <Button
              type="button"
              size="sm"
              className="rounded-md"
              disabled={!selectedStatus || updateStatus.isPending}
              onClick={handleUpdateStatus}
            >
              {updateStatus.isPending ? 'Updating…' : 'Update Status'}
            </Button>
          </div>
        ) : (
          <p className="mt-2 text-sm text-ink/50">
            {order.status === 'CANCELLED' ? 'This order was cancelled by the customer.' : 'This order has reached its final status.'}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <section className="rounded-lg border border-black/10 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/60">Customer</h2>
          <div className="mt-3 text-sm text-ink/80">
            <p className="font-medium text-ink">{order.customerName}</p>
            <p>{order.customerEmail}</p>
            <Link to={`/admin/customers/${order.customerId}`} className="mt-2 inline-block text-xs text-gold-dark underline underline-offset-4">
              View customer
            </Link>
          </div>
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/60">Shipping Address</h2>
          <div className="mt-3 text-sm text-ink/80">
            <p className="font-medium text-ink">{address.fullName}</p>
            <p>
              {address.addressLine1}
              {address.addressLine2 ? `, ${address.addressLine2}` : ''}
            </p>
            <p>
              {address.city}, {address.state} {address.postalCode}
            </p>
            <p>{address.country}</p>
            <p className="mt-2">{address.phoneNumber}</p>
          </div>
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/60">Payment</h2>
          <div className="mt-3 flex flex-col gap-2 text-sm text-ink/80">
            <div className="flex items-center justify-between">
              <span className="text-ink/50">Method</span>
              <span>{formatPaymentMethod(order.paymentMethod)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink/50">Status</span>
              <span>{order.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}</span>
            </div>
            {order.paymentReference && <p className="text-xs text-ink/40">Ref: {order.paymentReference}</p>}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-black/10 bg-white">
        <h2 className="px-5 pt-5 text-sm font-semibold uppercase tracking-wide text-ink/60">Items</h2>
        <div className="mt-3 flex flex-col divide-y divide-black/5 px-5 pb-5">
          {order.items.map((item) => (
            <div key={item.productId} className="flex items-center gap-4 py-4">
              <div className="h-16 w-12 shrink-0 overflow-hidden rounded bg-black/5">
                {item.productImageUrl && <img src={item.productImageUrl} alt={item.productName} className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1">
                <span className="block text-[10px] uppercase tracking-wide text-ink/40">{item.ornamentId}</span>
                <p className="text-sm font-medium text-ink">{item.productName}</p>
                <p className="text-xs text-ink/50">
                  Qty {item.quantity} × {formatPrice(item.unitPrice)}
                </p>
              </div>
              <div className="text-right text-sm font-medium text-ink">{formatPrice(item.lineTotal)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="ml-auto w-full max-w-sm rounded-lg border border-black/10 bg-white p-5">
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between text-ink/70">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-ink/70">
            <span>Shipping</span>
            <span>{formatPrice(order.shippingFee)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-black/10 pt-2 text-base font-semibold text-ink">
            <span>Total</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </section>
    </div>
  )
}
