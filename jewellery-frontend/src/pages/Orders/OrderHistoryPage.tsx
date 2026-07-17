import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, PackageSearch } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useOrders } from '@/hooks/useOrders'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { RevealText } from '@/components/common/RevealText'
import { formatDate, formatPrice } from '@/lib/utils'
import { OrderStatusBadge } from './OrderStatusBadge'

const PAGE_SIZE = 10

export default function OrderHistoryPage() {
  const { isAuthenticated } = useAuth()
  const [page, setPage] = useState(0)
  const { data, isLoading, isError } = useOrders(page, PAGE_SIZE)

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 py-32 text-center">
        <PackageSearch className="h-12 w-12 text-gold" strokeWidth={1} />
        <h1 className="max-w-xl text-4xl font-medium text-ink md:text-5xl">Order History</h1>
        <p className="max-w-md text-ink/60">Sign in to view your past orders.</p>
        <div className="gold-divider my-2" />
        <Button asChild size="lg">
          <Link to="/login" state={{ from: '/orders' }}>
            Sign In
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="section-padding mx-auto max-w-[1100px]">
      <div className="mb-14 flex flex-col items-center text-center">
        <RevealText as="span" className="eyebrow">
          Your Account
        </RevealText>
        <RevealText as="h1" delay={0.1} className="mt-4 text-4xl text-ink md:text-5xl">
          Order History
        </RevealText>
        <div className="gold-divider mt-6" />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-center text-ink/60">Could not load your orders right now. Please try again in a moment.</p>
      ) : !data || data.content.length === 0 ? (
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <PackageSearch className="h-12 w-12 text-gold" strokeWidth={1} />
          <p className="text-ink/60">No orders yet.</p>
          <Button asChild size="lg">
            <Link to="/products">Browse Collection</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {data.content.map((order) => (
              <Link
                key={order.orderNumber}
                to={`/orders/${order.orderNumber}`}
                className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-6 shadow-[0_2px_8px_rgba(10,10,10,0.04)] transition-colors duration-200 hover:border-gold/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-lg text-ink">{order.orderNumber}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 text-sm text-ink/50">
                    Placed on {formatDate(order.placedAt)} · {order.itemCount}{' '}
                    {order.itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <div className="text-right font-serif text-lg text-ink">{formatPrice(order.totalAmount)}</div>
              </Link>
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={data.first ?? page === 0}
                className="gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} /> Previous
              </Button>
              <span className="text-sm text-ink/60">
                Page {page + 1} of {data.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
                disabled={data.last ?? page >= data.totalPages - 1}
                className="gap-1"
              >
                Next <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
