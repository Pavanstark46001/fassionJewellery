import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useAdminProducts, useDeleteAdminProduct } from '@/hooks/admin/useAdminProducts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { formatPrice } from '@/lib/utils'
import { STOCK_LABELS, STOCK_VARIANTS } from '@/lib/stockStatus'

const PAGE_SIZE = 10

export default function AdminProductListPage() {
  const [page, setPage] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [q, setQ] = useState('')

  const { data, isLoading, isError } = useAdminProducts({ q: q || undefined, page, size: PAGE_SIZE })
  const deleteProduct = useDeleteAdminProduct()

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPage(0)
    setQ(searchInput.trim())
  }

  function handleDelete(id: string, name: string) {
    const confirmed = window.confirm(`Delete "${name}"? This cannot be undone.`)
    if (!confirmed) return
    deleteProduct.mutate(id, {
      onSuccess: () => toast.success('Product deleted.'),
      onError: (error) => toast.error(error?.message ?? 'Could not delete this product.'),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Products</h1>
          <p className="mt-1 text-sm text-ink/50">Manage the storefront catalog.</p>
        </div>
        <Button asChild size="sm" className="gap-1.5 rounded-md">
          <Link to="/admin/products/new">
            <Plus className="h-4 w-4" strokeWidth={2} />
            New Product
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex max-w-sm items-center gap-2">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search products…"
          className="h-10 rounded-md px-4"
        />
        <Button type="submit" variant="outline" size="sm" className="h-10 rounded-md px-3">
          <Search className="h-4 w-4" strokeWidth={1.75} />
        </Button>
      </form>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : isError || !data ? (
        <p className="text-sm text-ink/60">Could not load products right now.</p>
      ) : data.content.length === 0 ? (
        <p className="rounded-lg border border-black/10 bg-white p-8 text-center text-sm text-ink/50">
          No products found.
        </p>
      ) : (
        <div className="rounded-lg border border-black/10 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Ornament ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.content.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="h-12 w-10 overflow-hidden rounded bg-black/5">
                      {product.primaryImageUrl && (
                        <img src={product.primaryImageUrl} alt={product.name} className="h-full w-full object-cover" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate font-medium text-ink">{product.name}</TableCell>
                  <TableCell className="font-mono text-xs">{product.ornamentId}</TableCell>
                  <TableCell>{product.categoryName ?? '—'}</TableCell>
                  <TableCell>
                    {product.discountedPrice != null ? (
                      <div className="flex flex-col">
                        <span>{formatPrice(product.discountedPrice)}</span>
                        <span className="text-xs text-ink/40 line-through">{formatPrice(product.basePrice)}</span>
                      </div>
                    ) : (
                      formatPrice(product.basePrice)
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.isFeatured ? 'gold' : 'muted'} size="pill">
                      {product.isFeatured ? 'Featured' : 'Standard'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STOCK_VARIANTS[product.stockStatus]} size="pill">
                      {STOCK_LABELS[product.stockStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        className="rounded-md border border-black/10 p-1.5 text-ink/60 transition-colors hover:border-gold-dark hover:text-gold-dark"
                      >
                        <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id, product.name)}
                        className="rounded-md border border-black/10 p-1.5 text-ink/60 transition-colors hover:border-red-300 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <AdminPagination
            page={page}
            totalPages={data.totalPages}
            first={data.first}
            last={data.last}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
