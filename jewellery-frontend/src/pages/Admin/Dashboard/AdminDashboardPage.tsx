import { Link } from 'react-router-dom'
import { ClipboardList, IndianRupee, Package, Users, type LucideIcon } from 'lucide-react'
import { useAdminDashboard } from '@/hooks/admin/useAdminDashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { OrderStatusBadge } from '@/pages/Orders/OrderStatusBadge'
import { formatDate, formatPrice } from '@/lib/utils'
import type { OrderStatus } from '@/types/api'

const STATUS_ORDER: OrderStatus[] = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-black/10 bg-white p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-gold/15 text-gold-dark">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-ink/50">{label}</p>
        <p className="mt-0.5 text-xl font-semibold text-ink">{value}</p>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const { data, isLoading, isError } = useAdminDashboard()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !data) {
    return <p className="text-sm text-ink/60">Could not load the dashboard summary right now.</p>
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-ink/50">Store overview at a glance.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Products" value={data.totalProducts.toLocaleString('en-IN')} icon={Package} />
        <StatCard label="Total Customers" value={data.totalCustomers.toLocaleString('en-IN')} icon={Users} />
        <StatCard label="Total Orders" value={data.totalOrders.toLocaleString('en-IN')} icon={ClipboardList} />
        <StatCard label="Total Revenue" value={formatPrice(data.totalRevenue)} icon={IndianRupee} />
      </div>

      <div className="rounded-lg border border-black/10 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/60">Orders by Status</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {STATUS_ORDER.map((status) => (
            <div key={status} className="flex items-center gap-2 rounded-md border border-black/10 px-3 py-2">
              <OrderStatusBadge status={status} />
              <span className="text-sm font-medium text-ink">{data.ordersByStatus[status] ?? 0}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-black/10 bg-white">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/60">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-gold-dark underline underline-offset-4">
            View all
          </Link>
        </div>
        {data.recentOrders.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-ink/50">No orders yet.</p>
        ) : (
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
              {data.recentOrders.map((order) => (
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
        )}
      </div>
    </div>
  )
}
