import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import {
  CheckCircle2,
  Loader2,
  Minus,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Trash2,
  UserPlus,
  UserRound,
  UserSearch,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  usePosProductLookup,
  usePosCustomerSearch,
  useCreatePosCustomer,
  useCreatePosSale,
  usePosInvoice,
} from '@/hooks/admin/usePos'
import { cn, formatPrice } from '@/lib/utils'
import type {
  PosCustomerSearchResult,
  PosPaymentMethod,
  PosProductLookup,
  PosSalePayload,
  PosSaleResult,
} from '@/types/admin'

/** Flat GST rate — mirrors `PosService.GST_RATE`. The server recomputes and
 * owns this number; this is a live client-side preview only. */
const GST_RATE = 0.03

interface CartLine {
  productId: string
  ornamentId: string
  name: string
  primaryImageUrl: string | null
  unitPrice: number
  quantity: number
}

const PAYMENT_METHODS: { value: PosPaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'ONLINE', label: 'Online' },
]

const TOGGLE_BUTTON_CLASS = (active: boolean) =>
  cn(
    'flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
    active ? 'border-gold-dark bg-gold/10 text-gold-dark' : 'border-black/10 text-ink/60 hover:border-black/20',
  )

export default function PosBillingPage() {
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [searchCode, setSearchCode] = useState('')
  const [lookupResults, setLookupResults] = useState<PosProductLookup[]>([])
  const [lookupMessage, setLookupMessage] = useState<string | null>(null)

  const [cart, setCart] = useState<CartLine[]>([])

  const [walkInName, setWalkInName] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [customerResults, setCustomerResults] = useState<PosCustomerSearchResult[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<PosCustomerSearchResult | null>(null)

  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerPhone, setNewCustomerPhone] = useState('')
  const [newCustomerEmail, setNewCustomerEmail] = useState('')

  const [discountInput, setDiscountInput] = useState('0')
  const [paymentMethod, setPaymentMethod] = useState<PosPaymentMethod>('CASH')

  const [saleResult, setSaleResult] = useState<PosSaleResult | null>(null)

  const productLookup = usePosProductLookup()
  const customerSearch = usePosCustomerSearch()
  const createCustomer = useCreatePosCustomer()
  const createSale = useCreatePosSale()
  const posInvoice = usePosInvoice()

  const subtotal = useMemo(() => cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0), [cart])
  const discountAmount = useMemo(() => {
    const parsed = Number.parseFloat(discountInput)
    if (Number.isNaN(parsed) || parsed < 0) return 0
    return Math.min(parsed, subtotal)
  }, [discountInput, subtotal])
  const taxableAmount = subtotal - discountAmount
  const gstAmount = taxableAmount * GST_RATE
  const totalAmount = taxableAmount + gstAmount

  function focusSearch() {
    requestAnimationFrame(() => searchInputRef.current?.focus())
  }

  function addToCart(product: PosProductLookup, quantity = 1) {
    const unitPrice = product.discountedPrice ?? product.basePrice
    setCart((prev) => {
      const existing = prev.find((line) => line.productId === product.id)
      if (existing) {
        return prev.map((line) =>
          line.productId === product.id ? { ...line, quantity: line.quantity + quantity } : line,
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          ornamentId: product.ornamentId,
          name: product.name,
          primaryImageUrl: product.primaryImageUrl,
          unitPrice,
          quantity,
        },
      ]
    })
    setSearchCode('')
    setLookupResults([])
    setLookupMessage(null)
    focusSearch()
  }

  function runProductLookup(code: string) {
    const trimmed = code.trim()
    if (!trimmed || productLookup.isPending) return

    // Same rule the backend uses to pick exact-match vs. name-fallback: an
    // ORN-NNNNNN-shaped code always resolves to 0-1 exact matches; anything
    // else is a name search that can return several.
    const isOrnamentCode = /^ORN-\d+$/i.test(trimmed)

    productLookup.mutate(trimmed, {
      onSuccess: (results) => {
        if (isOrnamentCode) {
          if (results.length === 1) {
            addToCart(results[0])
          } else {
            setLookupResults([])
            setLookupMessage('No matching product for that ornament ID.')
          }
          return
        }
        if (results.length === 0) {
          setLookupResults([])
          setLookupMessage('No matching product.')
        } else {
          setLookupResults(results)
          setLookupMessage(null)
        }
      },
      onError: (error) => toast.error(error?.message ?? 'Could not look up that item.'),
    })
  }

  function handleLookupSubmit(event: FormEvent) {
    event.preventDefault()
    runProductLookup(searchCode)
  }

  // Live search as the cashier types or a barcode scanner streams input —
  // debounced so a fast scan resolves once, not once per character.
  useEffect(() => {
    const trimmed = searchCode.trim()
    if (trimmed.length < 2) return
    const timer = setTimeout(() => runProductLookup(trimmed), 350)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchCode])

  function handleQuantityChange(productId: string, delta: number) {
    setCart((prev) =>
      prev.map((line) => (line.productId === productId ? { ...line, quantity: Math.max(1, line.quantity + delta) } : line)),
    )
  }

  function handleRemove(productId: string) {
    setCart((prev) => prev.filter((line) => line.productId !== productId))
  }

  function handlePhoneInputChange(value: string) {
    setPhoneInput(value)
    if (selectedCustomer) setSelectedCustomer(null)
    if (customerResults.length > 0) setCustomerResults([])
    if (customerSearch.isSuccess || customerSearch.isError) customerSearch.reset()
  }

  function runCustomerSearch(phone: string) {
    const trimmed = phone.trim()
    if (!trimmed || customerSearch.isPending) return
    customerSearch.mutate(trimmed, {
      onSuccess: (results) => {
        if (results.length === 1) {
          setSelectedCustomer(results[0])
          setCustomerResults([])
        } else if (results.length === 0) {
          setSelectedCustomer(null)
          setCustomerResults([])
          openCreateCustomer()
        } else {
          setSelectedCustomer(null)
          setCustomerResults(results)
        }
      },
      onError: (error) => toast.error(error?.message ?? 'Could not search customers.'),
    })
  }

  function handleCustomerSearch(event: FormEvent) {
    event.preventDefault()
    runCustomerSearch(phoneInput)
  }

  // Auto-search the moment a full 10-digit phone number has been entered —
  // no need to press the lookup button.
  useEffect(() => {
    const digitsOnly = phoneInput.replace(/\D/g, '')
    if (digitsOnly.length !== 10) return
    const timer = setTimeout(() => runCustomerSearch(phoneInput), 200)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneInput])

  function handleSelectCustomer(customer: PosCustomerSearchResult) {
    setSelectedCustomer(customer)
    setCustomerResults([])
  }

  function handleChangeCustomer() {
    setSelectedCustomer(null)
    setCustomerResults([])
    setPhoneInput('')
    setWalkInName('')
    customerSearch.reset()
  }

  // Opened from the "no registered customer" empty state — pre-fills from
  // whatever the cashier already typed so they're not retyping the phone
  // number (and the walk-in name, if they'd started one) a second time.
  function openCreateCustomer() {
    setNewCustomerName(walkInName.trim())
    setNewCustomerPhone(phoneInput.trim())
    setNewCustomerEmail('')
    setIsCreateCustomerOpen(true)
  }

  function closeCreateCustomer() {
    setIsCreateCustomerOpen(false)
    createCustomer.reset()
  }

  function handleCreateCustomerSubmit(event: FormEvent) {
    event.preventDefault()
    if (!newCustomerName.trim() || !newCustomerPhone.trim() || createCustomer.isPending) return

    createCustomer.mutate(
      {
        fullName: newCustomerName.trim(),
        phoneNumber: newCustomerPhone.trim(),
        ...(newCustomerEmail.trim() ? { email: newCustomerEmail.trim() } : {}),
      },
      {
        onSuccess: (customer) => {
          handleSelectCustomer(customer)
          setIsCreateCustomerOpen(false)
          toast.success(`${customer.fullName} saved — they'll be found by phone next visit.`)
        },
        onError: (error) => toast.error(error?.message ?? 'Could not save this customer.'),
      },
    )
  }

  function handleCompleteSale() {
    if (cart.length === 0 || createSale.isPending) return

    const payload: PosSalePayload = {
      items: cart.map((line) => ({ productId: line.productId, quantity: line.quantity })),
      discountAmount,
      paymentMethod,
    }
    if (selectedCustomer) {
      payload.customerId = selectedCustomer.id
    } else {
      if (walkInName.trim()) payload.walkInCustomerName = walkInName.trim()
      if (phoneInput.trim()) payload.walkInCustomerPhone = phoneInput.trim()
    }

    createSale.mutate(payload, {
      onSuccess: (data) => {
        setSaleResult(data)
        toast.success(`Sale ${data.orderNumber} completed.`)
      },
      onError: (error) => toast.error(error?.message ?? 'Could not complete the sale.'),
    })
  }

  function handleNewSale() {
    setCart([])
    setWalkInName('')
    setPhoneInput('')
    setCustomerResults([])
    setSelectedCustomer(null)
    customerSearch.reset()
    setIsCreateCustomerOpen(false)
    createCustomer.reset()
    setDiscountInput('0')
    setPaymentMethod('CASH')
    setSaleResult(null)
    setSearchCode('')
    setLookupResults([])
    setLookupMessage(null)
    focusSearch()
  }

  function handlePrintInvoice(format: 'A4' | 'THERMAL') {
    if (!saleResult) return
    posInvoice.mutate(
      { orderNumber: saleResult.orderNumber, format },
      { onError: (error) => toast.error(error?.message ?? 'Could not download the invoice.') },
    )
  }

  if (saleResult) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6">
        <div className="w-full max-w-md rounded-lg border border-black/10 bg-white p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" strokeWidth={1.5} />
          <h1 className="mt-4 text-xl font-semibold text-ink">Sale Completed</h1>
          <p className="mt-1 text-sm text-ink/50">Order {saleResult.orderNumber}</p>

          <div className="mt-6 flex flex-col gap-2 rounded-md bg-black/[0.03] p-4 text-left text-sm">
            <div className="flex items-center justify-between text-ink/70">
              <span>Subtotal</span>
              <span>{formatPrice(saleResult.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-ink/70">
              <span>Discount</span>
              <span>-{formatPrice(saleResult.discountAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-ink/70">
              <span>GST (3%)</span>
              <span>{formatPrice(saleResult.gstAmount)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between border-t border-black/10 pt-2 text-base font-semibold text-ink">
              <span>Total</span>
              <span>{formatPrice(saleResult.totalAmount)}</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-ink/50">
            Paid by {saleResult.paymentMethod} &middot; {saleResult.walkInCustomerName ?? 'Registered customer'}
          </p>

          <div className="mt-6 flex flex-col gap-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 rounded-md"
                disabled={posInvoice.isPending}
                onClick={() => handlePrintInvoice('THERMAL')}
              >
                <Printer className="h-3.5 w-3.5" strokeWidth={1.75} /> Receipt (Thermal)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 rounded-md"
                disabled={posInvoice.isPending}
                onClick={() => handlePrintInvoice('A4')}
              >
                <Printer className="h-3.5 w-3.5" strokeWidth={1.75} /> Invoice (A4)
              </Button>
            </div>
            <Button type="button" size="sm" className="gap-1.5 rounded-md" onClick={handleNewSale}>
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} /> New Sale
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Billing</h1>
        <p className="mt-1 text-sm text-ink/50">Ring up an in-store sale.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Left column: item entry & cart */}
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-black/10 bg-white p-4">
            <form onSubmit={handleLookupSubmit} className="flex items-center gap-2">
              <Input
                ref={searchInputRef}
                autoFocus
                autoComplete="off"
                value={searchCode}
                onChange={(event) => setSearchCode(event.target.value)}
                placeholder="Scan barcode or search by name/ornament ID"
                className="h-11 flex-1 rounded-md px-4"
              />
              <Button
                type="submit"
                size="sm"
                className="h-11 gap-1.5 rounded-md px-4"
                disabled={productLookup.isPending || !searchCode.trim()}
              >
                {productLookup.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" strokeWidth={1.75} />
                )}
                Search
              </Button>
            </form>

            {lookupMessage && <p className="mt-2 text-sm text-ink/50">{lookupMessage}</p>}

            {lookupResults.length > 0 && (
              <div className="mt-3 flex flex-col divide-y divide-black/5 rounded-md border border-black/10">
                {lookupResults.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addToCart(product)}
                    className="flex items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-black/[0.03]"
                  >
                    <div className="h-10 w-8 shrink-0 overflow-hidden rounded bg-black/5">
                      {product.primaryImageUrl && (
                        <img src={product.primaryImageUrl} alt={product.name} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[10px] uppercase tracking-wide text-ink/40">{product.ornamentId}</span>
                      <p className="truncate text-sm font-medium text-ink">{product.name}</p>
                    </div>
                    <div className="shrink-0 text-sm font-medium text-ink">
                      {formatPrice(product.discountedPrice ?? product.basePrice)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-black/10 bg-white">
            <h2 className="px-4 pt-4 text-sm font-semibold uppercase tracking-wide text-ink/60">
              Cart{cart.length > 0 ? ` (${cart.length})` : ''}
            </h2>
            {cart.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-ink/50">No items yet. Scan or search to add.</p>
            ) : (
              <div className="flex flex-col divide-y divide-black/5 px-4 py-2">
                {cart.map((line) => (
                  <div key={line.productId} className="flex items-center gap-3 py-3">
                    <div className="h-12 w-10 shrink-0 overflow-hidden rounded bg-black/5">
                      {line.primaryImageUrl && (
                        <img src={line.primaryImageUrl} alt={line.name} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[10px] uppercase tracking-wide text-ink/40">{line.ornamentId}</span>
                      <p className="truncate text-sm font-medium text-ink">{line.name}</p>
                      <p className="text-xs text-ink/50">{formatPrice(line.unitPrice)} each</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(line.productId, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-black/10 text-ink/60 transition-colors hover:border-gold-dark hover:text-gold-dark"
                      >
                        <Minus className="h-3 w-3" strokeWidth={2} />
                      </button>
                      <span className="w-6 text-center text-sm">{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(line.productId, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-black/10 text-ink/60 transition-colors hover:border-gold-dark hover:text-gold-dark"
                      >
                        <Plus className="h-3 w-3" strokeWidth={2} />
                      </button>
                    </div>
                    <div className="w-20 shrink-0 text-right text-sm font-medium text-ink">
                      {formatPrice(line.unitPrice * line.quantity)}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(line.productId)}
                      className="shrink-0 rounded-md p-1.5 text-ink/40 transition-colors hover:text-red-600"
                      aria-label={`Remove ${line.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: customer, discount, bill preview, checkout */}
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-black/10 bg-white p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/60">Customer</h2>

            {selectedCustomer ? (
              <div className="mt-3 flex items-center justify-between gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{selectedCustomer.fullName}</p>
                  <p className="truncate text-xs text-ink/50">
                    {selectedCustomer.phoneNumber} &middot; {selectedCustomer.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleChangeCustomer}
                  className="shrink-0 rounded-md p-1.5 text-ink/40 transition-colors hover:text-red-600"
                  aria-label="Change customer"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            ) : (
              <div className="mt-3">
                <form onSubmit={handleCustomerSearch} className="flex items-center gap-2">
                  <Input
                    autoComplete="off"
                    value={phoneInput}
                    onChange={(event) => handlePhoneInputChange(event.target.value)}
                    placeholder="Customer phone number"
                    className="h-10 flex-1 rounded-md px-4"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="h-10 rounded-md px-3"
                    disabled={customerSearch.isPending || !phoneInput.trim()}
                  >
                    {customerSearch.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserSearch className="h-4 w-4" strokeWidth={1.75} />
                    )}
                  </Button>
                </form>

                {customerResults.length > 0 && (
                  <div className="mt-2 flex flex-col divide-y divide-black/5 rounded-md border border-black/10">
                    {customerResults.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => handleSelectCustomer(customer)}
                        className="flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-black/[0.03]"
                      >
                        <UserRound className="h-4 w-4 shrink-0 text-ink/40" strokeWidth={1.75} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">{customer.fullName}</p>
                          <p className="truncate text-xs text-ink/50">
                            {customer.phoneNumber} &middot; {customer.email}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {customerSearch.isSuccess && customerResults.length === 0 && (
                  <div className="mt-3 flex flex-col gap-2">
                    <p className="text-xs text-ink/50">
                      No registered customer with this number. Enter a name to bill as a one-off walk-in, or save
                      their details so they're recognized next visit.
                    </p>
                    <Input
                      value={walkInName}
                      onChange={(event) => setWalkInName(event.target.value)}
                      placeholder="Customer name (optional)"
                      className="h-10 rounded-md px-4"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 w-full justify-center gap-1.5 rounded-md"
                      onClick={openCreateCustomer}
                    >
                      <UserPlus className="h-3.5 w-3.5" strokeWidth={1.75} />
                      Save as New Customer
                    </Button>
                  </div>
                )}

                {!customerSearch.isSuccess && (
                  <p className="mt-2 text-xs text-ink/40">
                    Look up an existing customer, or leave blank to bill as a walk-in.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-black/10 bg-white p-4">
            <label className="text-sm font-semibold uppercase tracking-wide text-ink/60" htmlFor="pos-discount">
              Discount
            </label>
            <Input
              id="pos-discount"
              type="number"
              min={0}
              step="0.01"
              value={discountInput}
              onChange={(event) => setDiscountInput(event.target.value)}
              className="mt-2 h-10 rounded-md px-4"
            />
          </div>

          <div className="rounded-lg border border-black/10 bg-white p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/60">Payment Method</h2>
            <div className="mt-3 flex gap-2">
              {PAYMENT_METHODS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPaymentMethod(value)}
                  className={TOGGLE_BUTTON_CLASS(paymentMethod === value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-black/10 bg-white p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/60">Bill Summary</h2>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between text-ink/70">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-ink/70">
                <span>Discount</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-ink/70">
                <span>GST (3%)</span>
                <span>{formatPrice(gstAmount)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-black/10 pt-2 text-base font-semibold text-ink">
                <span>Total</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-ink/40">Estimate — the server confirms the final total on checkout.</p>

            <Button
              type="button"
              className="mt-4 w-full gap-1.5 rounded-md"
              disabled={cart.length === 0 || createSale.isPending}
              onClick={handleCompleteSale}
            >
              {createSale.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Complete Sale
            </Button>
          </div>
        </div>
      </div>

      {isCreateCustomerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeCreateCustomer}
        >
          <div
            className="w-full max-w-sm rounded-lg border border-black/10 bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">New Customer</h2>
              <button
                type="button"
                onClick={closeCreateCustomer}
                aria-label="Close"
                className="rounded-md p-1 text-ink/40 transition-colors hover:text-ink"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
            <p className="mt-1 text-xs text-ink/50">
              Saved to their account — they'll be found by phone number on their next visit.
            </p>

            <form onSubmit={handleCreateCustomerSubmit} className="mt-4 flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-ink/60" htmlFor="new-customer-name">
                  Name
                </label>
                <Input
                  id="new-customer-name"
                  autoFocus
                  value={newCustomerName}
                  onChange={(event) => setNewCustomerName(event.target.value)}
                  placeholder="Full name"
                  className="mt-1 h-10 rounded-md px-4"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink/60" htmlFor="new-customer-phone">
                  Phone number
                </label>
                <Input
                  id="new-customer-phone"
                  value={newCustomerPhone}
                  onChange={(event) => setNewCustomerPhone(event.target.value)}
                  placeholder="10-digit phone number"
                  className="mt-1 h-10 rounded-md px-4"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink/60" htmlFor="new-customer-email">
                  Email <span className="text-ink/40">(optional)</span>
                </label>
                <Input
                  id="new-customer-email"
                  type="email"
                  value={newCustomerEmail}
                  onChange={(event) => setNewCustomerEmail(event.target.value)}
                  placeholder="For receipts and rewards"
                  className="mt-1 h-10 rounded-md px-4"
                />
              </div>

              <div className="mt-2 flex gap-2">
                <Button type="button" variant="outline" className="flex-1 rounded-md" onClick={closeCreateCustomer}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 gap-1.5 rounded-md"
                  disabled={!newCustomerName.trim() || !newCustomerPhone.trim() || createCustomer.isPending}
                >
                  {createCustomer.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Customer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
