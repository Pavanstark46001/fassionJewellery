import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { FileDown, PackageX } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCancelOrder, useDownloadInvoice, useOrderDetail, usePayOrder } from '@/hooks/useOrders'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { RevealText } from '@/components/common/RevealText'
import { formatDate, formatPrice } from '@/lib/utils'
import { OrderStatusBadge } from './OrderStatusBadge'

export default function OrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const { isAuthenticated } = useAuth()
  const { data: order, isLoading, isError } = useOrderDetail(orderNumber)
  const cancelOrder = useCancelOrder()
  const downloadInvoice = useDownloadInvoice()
  const payOrder = usePayOrder()

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 py-32 text-center">
        <h1 className="max-w-xl text-4xl font-medium text-ink md:text-5xl">Order Details</h1>
        <p className="max-w-md text-ink/60">Sign in to view this order.</p>
        <div className="gold-divider my-2" />
        <Button asChild size="lg">
          <Link to="/login" state={{ from: `/orders/${orderNumber ?? ''}` }}>
            Sign In
          </Link>
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="section-padding mx-auto max-w-[900px]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 py-32 text-center">
        <PackageX className="h-12 w-12 text-gold" strokeWidth={1} />
        <h1 className="max-w-xl text-4xl font-medium text-ink md:text-5xl">Order Not Found</h1>
        <p className="max-w-md text-ink/60">
          We couldn't find this order. It may not exist, or it may belong to a different account.
        </p>
        <div className="gold-divider my-2" />
        <Button asChild size="lg">
          <Link to="/orders">Back to Orders</Link>
        </Button>
      </div>
    )
  }

  function handleCancel() {
    if (!order) return
    const confirmed = window.confirm(
      `Are you sure you want to cancel order ${order.orderNumber}? This cannot be undone.`,
    )
    if (!confirmed) return

    cancelOrder.mutate(order.orderNumber, {
      onSuccess: () => toast.success('Order cancelled.'),
      onError: (error) => toast.error(error?.message ?? 'Could not cancel this order.'),
    })
  }

  function handleDownloadInvoice() {
    if (!order) return
    downloadInvoice.mutate(order.orderNumber, {
      onError: (error) => toast.error(error?.message ?? 'Could not download the invoice.'),
    })
  }

  function handlePayNow() {
    if (!order) return
    payOrder.mutate(order.orderNumber, {
      onSuccess: () => toast.success('Payment confirmed.'),
      onError: (error) => toast.error(error?.message ?? 'Could not complete payment. Please try again.'),
    })
  }

  const address = order.shippingAddress

  return (
    <div className="section-padding mx-auto max-w-[900px]">
      <div className="mb-12 flex flex-col items-center text-center">
        <RevealText as="span" className="eyebrow">
          Order Details
        </RevealText>
        <RevealText as="h1" delay={0.1} className="mt-4 text-4xl text-ink md:text-5xl">
          {order.orderNumber}
        </RevealText>
        <div className="mt-4 flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          <span className="text-sm text-ink/50">Placed on {formatDate(order.placedAt)}</span>
        </div>
        <div className="gold-divider mt-6" />
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={handleDownloadInvoice} disabled={downloadInvoice.isPending}>
          <FileDown className="h-3.5 w-3.5" strokeWidth={1.5} />
          {downloadInvoice.isPending ? 'Preparing…' : 'Download Invoice'}
        </Button>
        {order.status === 'PLACED' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-red-600 hover:bg-red-50"
            onClick={handleCancel}
            disabled={cancelOrder.isPending}
          >
            {cancelOrder.isPending ? 'Cancelling…' : 'Cancel Order'}
          </Button>
        )}
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <section className="rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="font-serif text-lg text-ink">Shipping Address</h2>
          <div className="mt-3 text-sm text-ink/70">
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

        <section className="rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="font-serif text-lg text-ink">Payment</h2>
          <div className="mt-3 flex flex-col gap-2 text-sm text-ink/70">
            <div className="flex items-center justify-between">
              <span>Method</span>
              <span className="text-ink">
                {order.paymentMethod === 'ONLINE' ? 'Pay Online' : 'Cash on Delivery'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Status</span>
              <span className="text-ink">{order.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}</span>
            </div>
            {order.paymentReference && (
              <p className="text-right font-mono text-xs text-ink/40">Ref: {order.paymentReference}</p>
            )}
          </div>
          {order.paymentMethod === 'ONLINE' && order.paymentStatus === 'PENDING' && (
            <Button
              type="button"
              size="sm"
              className="mt-4 w-full"
              onClick={handlePayNow}
              disabled={payOrder.isPending}
            >
              {payOrder.isPending ? 'Processing…' : 'Pay Now'}
            </Button>
          )}
        </section>
      </div>

      <section className="mt-8">
        <h2 className="font-serif text-lg text-ink">Items</h2>
        <div className="mt-4 flex flex-col divide-y divide-black/5 rounded-2xl border border-black/5 bg-white px-6">
          {order.items.map((item) => (
            <div key={item.productId} className="flex gap-4 py-5">
              <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-black/[0.02]">
                <img
                  src={item.productImageUrl ?? '/images/products/product-necklaces.jpg'}
                  alt={item.productName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-center">
                <span className="text-[10px] uppercase tracking-[0.15em] text-ink/40">{item.ornamentId}</span>
                <h3 className="font-serif text-base text-ink">{item.productName}</h3>
                <p className="mt-1 text-sm text-ink/60">
                  Qty {item.quantity} × {formatPrice(item.unitPrice)}
                </p>
              </div>
              <div className="shrink-0 self-center text-right font-medium text-ink">
                {formatPrice(item.lineTotal)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 ml-auto max-w-sm rounded-2xl border border-black/5 bg-white p-6">
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between text-ink/70">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-ink/70">
            <span>Shipping</span>
            <span>{formatPrice(order.shippingFee)}</span>
          </div>
        </div>
        <div className="gold-divider my-4 w-full" />
        <div className="flex items-center justify-between font-serif text-lg text-ink">
          <span>Total</span>
          <span>{formatPrice(order.totalAmount)}</span>
        </div>
      </section>
    </div>
  )
}
