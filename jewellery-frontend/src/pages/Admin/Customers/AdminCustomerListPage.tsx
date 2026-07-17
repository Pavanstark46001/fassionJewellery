import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useAdminCustomers } from '@/hooks/admin/useAdminCustomers'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { formatDate } from '@/lib/utils'

const PAGE_SIZE = 10

export default function AdminCustomerListPage() {
  const [page, setPage] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [q, setQ] = useState('')

  const { data, isLoading, isError } = useAdminCustomers({ q: q || undefined, page, size: PAGE_SIZE })

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPage(0)
    setQ(searchInput.trim())
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Customers</h1>
        <p className="mt-1 text-sm text-ink/50">Everyone who has registered on the storefront.</p>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex max-w-sm items-center gap-2">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name or email…"
          className="h-10 rounded-md px-4"
        />
        <Button type="submit" variant="outline" size="sm" className="h-10 rounded-md px-3">
          <Search className="h-4 w-4" strokeWidth={1.75} />
        </Button>
      </form>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : isError || !data ? (
        <p className="text-sm text-ink/60">Could not load customers right now.</p>
      ) : data.content.length === 0 ? (
        <p className="rounded-lg border border-black/10 bg-white p-8 text-center text-sm text-ink/50">
          No customers found.
        </p>
      ) : (
        <div className="rounded-lg border border-black/10 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.content.map((customer) => (
                <TableRow key={customer.id} className="cursor-pointer">
                  <TableCell>
                    <Link to={`/admin/customers/${customer.id}`} className="font-medium text-gold-dark hover:underline">
                      {customer.fullName}
                    </Link>
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phoneNumber ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={customer.isActive ? 'success' : 'muted'} size="pill">
                      {customer.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{customer.orderCount}</TableCell>
                  <TableCell>{formatDate(customer.createdDate)}</TableCell>
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
