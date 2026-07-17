import { Fragment, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { ChevronDown, ChevronRight, History, MapPin, PackagePlus } from 'lucide-react'
import {
  useAdminInventory,
  useAdminStockMovements,
  useRecordStockMovement,
  useSetInventoryLocation,
} from '@/hooks/admin/useAdminInventory'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminPagination } from '@/components/admin/AdminPagination'
import type { AdminProductInventory, ManualMovementType, StockStatus } from '@/types/admin'

const PAGE_SIZE = 10
const MOVEMENTS_PAGE_SIZE = 10

const inputClass = 'h-10 rounded-md px-3'
const labelClass = 'mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/50'

const STOCK_LABELS: Record<StockStatus, string> = {
  IN_STOCK: 'In Stock',
  LOW_STOCK: 'Low Stock',
  OUT_OF_STOCK: 'Out of Stock',
  COMING_SOON: 'Coming Soon',
}

const STOCK_VARIANTS: Record<StockStatus, 'success' | 'gold' | 'danger' | 'muted'> = {
  IN_STOCK: 'success',
  LOW_STOCK: 'gold',
  OUT_OF_STOCK: 'danger',
  COMING_SOON: 'muted',
}

const MOVEMENT_TYPE_OPTIONS: { value: ManualMovementType; label: string }[] = [
  { value: 'PURCHASE_ENTRY', label: 'Purchase Entry' },
  { value: 'DAMAGE_ENTRY', label: 'Damage Entry' },
  { value: 'RETURN_ENTRY', label: 'Return Entry' },
  { value: 'STOCK_TRANSFER', label: 'Stock Transfer' },
]

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  PURCHASE_ENTRY: 'Purchase Entry',
  DAMAGE_ENTRY: 'Damage Entry',
  RETURN_ENTRY: 'Return Entry',
  STOCK_TRANSFER: 'Stock Transfer',
  SALE_DEDUCTION: 'Sale Deduction',
}

function formatLocation(inv: AdminProductInventory): string {
  const parts = [inv.warehouseName, inv.rackCode, inv.shelfCode].filter(Boolean)
  return parts.length > 0 ? parts.join(' / ') : 'Not set'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

function EditLocationForm({ product, onDone }: { product: AdminProductInventory; onDone: () => void }) {
  const [warehouseName, setWarehouseName] = useState(product.warehouseName ?? '')
  const [rackCode, setRackCode] = useState(product.rackCode ?? '')
  const [shelfCode, setShelfCode] = useState(product.shelfCode ?? '')
  const setLocation = useSetInventoryLocation()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLocation.mutate(
      {
        productId: product.productId,
        payload: {
          warehouseName: warehouseName.trim() || null,
          rackCode: rackCode.trim() || null,
          shelfCode: shelfCode.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast.success('Location updated.')
          onDone()
        },
        onError: (error) => toast.error(error?.message ?? 'Could not update the location.'),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-gold/30 bg-gold/5 p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-ink/60">Edit Location</h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Warehouse</label>
          <Input value={warehouseName} onChange={(e) => setWarehouseName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Rack</label>
          <Input value={rackCode} onChange={(e) => setRackCode(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Shelf</label>
          <Input value={shelfCode} onChange={(e) => setShelfCode(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="rounded-md" disabled={setLocation.isPending}>
          {setLocation.isPending ? 'Saving…' : 'Save Location'}
        </Button>
        <Button type="button" size="sm" variant="outline" className="rounded-md" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function RecordMovementForm({ product, onDone }: { product: AdminProductInventory; onDone: () => void }) {
  const [movementType, setMovementType] = useState<ManualMovementType>('PURCHASE_ENTRY')
  const [quantityChange, setQuantityChange] = useState('')
  const [note, setNote] = useState('')
  const recordMovement = useRecordStockMovement()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = Number.parseInt(quantityChange, 10)
    if (!Number.isFinite(parsed) || parsed === 0) {
      toast.error('Enter a non-zero quantity change.')
      return
    }
    recordMovement.mutate(
      { productId: product.productId, movementType, quantityChange: parsed, note: note.trim() || undefined },
      {
        onSuccess: () => {
          toast.success('Movement recorded.')
          onDone()
        },
        onError: (error) => toast.error(error?.message ?? 'Could not record this movement.'),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-gold/30 bg-gold/5 p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-ink/60">Record Movement</h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Movement Type</label>
          <Select value={movementType} onChange={(e) => setMovementType(e.target.value as ManualMovementType)}>
            {MOVEMENT_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className={labelClass}>Quantity Change</label>
          <Input
            type="number"
            value={quantityChange}
            onChange={(e) => setQuantityChange(e.target.value)}
            placeholder="e.g. 10 or -2"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Note</label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />
        </div>
      </div>
      <p className="text-xs text-ink/45">
        Positive to increase stock (purchase, return, incoming transfer); negative to decrease it (damage, outgoing
        transfer).
      </p>
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="rounded-md" disabled={recordMovement.isPending}>
          {recordMovement.isPending ? 'Recording…' : 'Record Movement'}
        </Button>
        <Button type="button" size="sm" variant="outline" className="rounded-md" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

type RowPanel = 'location' | 'movement' | null

function InventoryRowPanel({ product, panel, onDone }: { product: AdminProductInventory; panel: RowPanel; onDone: () => void }) {
  if (panel === 'location') return <EditLocationForm product={product} onDone={onDone} />
  if (panel === 'movement') return <RecordMovementForm product={product} onDone={onDone} />
  return null
}

function MovementHistorySection({
  productId,
  productLabel,
  onClearFilter,
}: {
  productId: string | null
  productLabel: string | null
  onClearFilter: () => void
}) {
  const [page, setPage] = useState(0)
  const { data, isLoading, isError } = useAdminStockMovements({
    productId: productId ?? undefined,
    page,
    size: MOVEMENTS_PAGE_SIZE,
  })

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Movement History</h2>
          <p className="mt-1 text-sm text-ink/50">
            {productId ? (
              <>
                Showing movements for <span className="font-medium text-ink/70">{productLabel}</span>.
              </>
            ) : (
              'Showing movements across all products.'
            )}
          </p>
        </div>
        {productId && (
          <Button type="button" size="sm" variant="outline" className="rounded-md" onClick={onClearFilter}>
            Show All Products
          </Button>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError || !data ? (
        <p className="text-sm text-ink/60">Could not load movement history right now.</p>
      ) : data.content.length === 0 ? (
        <p className="rounded-lg border border-black/10 bg-white p-8 text-center text-sm text-ink/50">
          No stock movements recorded yet.
        </p>
      ) : (
        <div className="rounded-lg border border-black/10 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Ornament ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Qty Change</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Order Ref</TableHead>
                <TableHead>By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.content.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="whitespace-nowrap text-xs">{formatDate(movement.createdDate)}</TableCell>
                  <TableCell className="font-mono text-xs">{movement.ornamentId}</TableCell>
                  <TableCell className="max-w-[180px] truncate">{movement.productName}</TableCell>
                  <TableCell>
                    <Badge variant={movement.quantityChange >= 0 ? 'success' : 'danger'} size="pill">
                      {MOVEMENT_TYPE_LABELS[movement.movementType] ?? movement.movementType}
                    </Badge>
                  </TableCell>
                  <TableCell className={movement.quantityChange >= 0 ? 'font-medium text-emerald-700' : 'font-medium text-red-600'}>
                    {movement.quantityChange >= 0 ? `+${movement.quantityChange}` : movement.quantityChange}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-ink/60">{movement.note ?? '—'}</TableCell>
                  <TableCell className="font-mono text-xs">{movement.referenceOrderNumber ?? '—'}</TableCell>
                  <TableCell className="text-xs text-ink/60">{movement.performedBy ?? '—'}</TableCell>
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
    </section>
  )
}

export default function AdminInventoryPage() {
  const [page, setPage] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [q, setQ] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [expandedRow, setExpandedRow] = useState<{ productId: string; panel: RowPanel } | null>(null)
  const [historyFilter, setHistoryFilter] = useState<{ productId: string; label: string } | null>(null)

  const { data, isLoading, isError } = useAdminInventory({
    q: q || undefined,
    lowStockOnly,
    page,
    size: PAGE_SIZE,
  })

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault()
    setPage(0)
    setQ(searchInput.trim())
  }

  function togglePanel(product: AdminProductInventory, panel: RowPanel) {
    setExpandedRow((current) =>
      current && current.productId === product.productId && current.panel === panel
        ? null
        : { productId: product.productId, panel },
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Inventory</h1>
        <p className="mt-1 text-sm text-ink/50">Track stock quantity, warehouse location, and stock movements.</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex max-w-sm items-center gap-2">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or ornament ID…"
            className="h-10 rounded-md px-4"
          />
          <Button type="submit" variant="outline" size="sm" className="h-10 rounded-md px-3">
            Search
          </Button>
        </form>

        <label className="flex items-center gap-2 text-sm text-ink/80">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => {
              setLowStockOnly(e.target.checked)
              setPage(0)
            }}
            className="h-4 w-4 accent-[#c9a961]"
          />
          Low stock only
        </label>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : isError || !data ? (
        <p className="text-sm text-ink/60">Could not load inventory right now.</p>
      ) : data.content.length === 0 ? (
        <p className="rounded-lg border border-black/10 bg-white p-8 text-center text-sm text-ink/50">
          No products found.
        </p>
      ) : (
        <div className="rounded-lg border border-black/10 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead />
                <TableHead>Ornament ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Stock Qty</TableHead>
                <TableHead>Low Stock Threshold</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.content.map((product) => {
                const isExpanded = expandedRow?.productId === product.productId
                return (
                  <Fragment key={product.productId}>
                    <TableRow>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => setExpandedRow(isExpanded ? null : { productId: product.productId, panel: null })}
                          className="rounded p-1 text-ink/50 hover:text-ink"
                          aria-label="Toggle details"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
                          ) : (
                            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{product.ornamentId}</TableCell>
                      <TableCell className="max-w-[220px] truncate font-medium text-ink">{product.name}</TableCell>
                      <TableCell>{product.stockQuantity}</TableCell>
                      <TableCell>{product.lowStockThreshold}</TableCell>
                      <TableCell className="text-sm text-ink/70">{formatLocation(product)}</TableCell>
                      <TableCell>
                        <Badge variant={STOCK_VARIANTS[product.stockStatus]} size="pill">
                          {STOCK_LABELS[product.stockStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            title="Edit Location"
                            onClick={() => togglePanel(product, 'location')}
                            className="rounded-md border border-black/10 p-1.5 text-ink/60 transition-colors hover:border-gold-dark hover:text-gold-dark"
                          >
                            <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </button>
                          <button
                            type="button"
                            title="Record Movement"
                            onClick={() => togglePanel(product, 'movement')}
                            className="rounded-md border border-black/10 p-1.5 text-ink/60 transition-colors hover:border-gold-dark hover:text-gold-dark"
                          >
                            <PackagePlus className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </button>
                          <button
                            type="button"
                            title="View Movement History"
                            onClick={() => setHistoryFilter({ productId: product.productId, label: product.name })}
                            className="rounded-md border border-black/10 p-1.5 text-ink/60 transition-colors hover:border-gold-dark hover:text-gold-dark"
                          >
                            <History className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {isExpanded && expandedRow?.panel && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-black/[0.02] p-4">
                          <InventoryRowPanel
                            product={product}
                            panel={expandedRow.panel}
                            onDone={() => setExpandedRow(null)}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                )
              })}
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

      <MovementHistorySection
        productId={historyFilter?.productId ?? null}
        productLabel={historyFilter?.label ?? null}
        onClearFilter={() => setHistoryFilter(null)}
      />
    </div>
  )
}
