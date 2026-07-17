import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminOrders } from '@/hooks/admin/useAdminOrders'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { OrderStatusBadge } from '@/pages/Orders/OrderStatusBadge'
import { formatDate, formatPrice } from '@/lib/utils'
import type { OrderStatus } from '@/types/api'

const PAGE_SIZE = 10

const STATUS_OPTIONS: { value: OrderStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'PLACED', label: 'Placed' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export default function AdminOrderListPage() {
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState<OrderStatus | ''>('')

  const { data, isLoading, isError } = useAdminOrders({ status: status || undefined, page, size: PAGE_SIZE })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Orders</h1>
        <p className="mt-1 text-sm text-ink/50">All orders placed across the storefront.</p>
      </div>

      <div className="max-w-xs">
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as OrderStatus | '')
            setPage(0)
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : isError || !data ? (
        <p className="text-sm text-ink/60">Could not load orders right now.</p>
      ) : data.content.length === 0 ? (
        <p className="rounded-lg border border-black/10 bg-white p-8 text-center text-sm text-ink/50">
          No orders found.
        </p>
      ) : (
        <div className="rounded-lg border border-black/10 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.content.map((order) => (
                <TableRow key={order.orderNumber} className="cursor-pointer">
                  <TableCell>
                    <Link to={`/admin/orders/${order.orderNumber}`} className="font-medium text-gold-dark hover:underline">
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-ink">{order.customerName}</span>
                      <span className="text-xs text-ink/50">{order.customerEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>{formatDate(order.placedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <AdminPagination page={page} totalPages={data.totalPages} first={data.first} last={data.last} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
