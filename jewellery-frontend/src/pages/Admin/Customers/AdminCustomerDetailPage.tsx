import { Link, useParams } from 'react-router-dom'
import { useAdminCustomer } from '@/hooks/admin/useAdminCustomers'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { OrderStatusBadge } from '@/pages/Orders/OrderStatusBadge'
import { formatDate, formatPrice } from '@/lib/utils'

export default function AdminCustomerDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const { data: customer, isLoading, isError } = useAdminCustomer(userId)

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />
  }

  if (isError || !customer) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm text-ink/60">Could not find this customer.</p>
        <Link to="/admin/customers" className="text-sm text-gold-dark underline underline-offset-4">
          Back to Customers
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-ink/50">
          <Link to="/admin/customers" className="text-gold-dark underline underline-offset-4">
            Customers
          </Link>{' '}
          / {customer.fullName}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">{customer.fullName}</h1>
      </div>

      <section className="rounded-lg border border-black/10 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/60">Profile</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-ink/40">Email</p>
            <p className="text-ink">{customer.email}</p>
          </div>
          <div>
            <p className="text-xs text-ink/40">Phone</p>
            <p className="text-ink">{customer.phoneNumber ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-ink/40">Status</p>
            <Badge variant={customer.isActive ? 'success' : 'muted'} size="pill">
              {customer.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-ink/40">Joined</p>
            <p className="text-ink">{formatDate(customer.createdDate)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-black/10 bg-white">
        <h2 className="px-5 pt-5 text-sm font-semibold uppercase tracking-wide text-ink/60">Order History</h2>
        {customer.orders.content.length === 0 ? (
          <p className="px-5 pb-5 pt-3 text-sm text-ink/50">This customer hasn't placed any orders yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customer.orders.content.map((order) => (
                <TableRow key={order.orderNumber}>
                  <TableCell>
                    <Link to={`/admin/orders/${order.orderNumber}`} className="font-medium text-gold-dark hover:underline">
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{order.itemCount}</TableCell>
                  <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>{formatDate(order.placedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  )
}
