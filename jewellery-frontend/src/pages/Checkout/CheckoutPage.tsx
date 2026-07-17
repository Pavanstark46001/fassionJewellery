import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearCart, selectCartItemCount, selectCartItems, selectCartSubtotal } from '@/store/cartSlice'
import { useAuth } from '@/hooks/useAuth'
import { useCreateOrder, usePayOrder } from '@/hooks/useOrders'
import { useWallet } from '@/hooks/useWallet'
import { Button } from '@/components/ui/button'
import { RevealText } from '@/components/common/RevealText'
import { AddressSection } from './AddressSection'
import { formatPrice } from '@/lib/utils'
import type { PaymentMethod } from '@/types/api'

const SHIPPING_FEE = 99

/** Deliberate UX pacing so the mock payment step doesn't feel instant/fake. */
const MOCK_PAYMENT_DELAY_MS = 1300

function PaymentOptionCard({
  title,
  description,
  selected,
  onSelect,
}: {
  title: string
  description: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full flex-col gap-1 rounded-2xl border p-5 text-left transition-colors duration-200',
        selected ? 'border-gold bg-gold/5 ring-1 ring-gold' : 'border-black/10 bg-white hover:border-gold/40',
      )}
    >
      <span className="flex items-center gap-2 font-serif text-base text-ink">
        <span
          className={cn(
            'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
            selected ? 'border-gold' : 'border-black/30',
          )}
        >
          {selected && <span className="h-2 w-2 rounded-full bg-gold" />}
        </span>
        {title}
      </span>
      <p className="pl-6 text-sm text-ink/60">{description}</p>
    </button>
  )
}

export default function CheckoutPage() {
  const items = useAppSelector(selectCartItems)
  const itemCount = useAppSelector(selectCartItemCount)
  const subtotal = useAppSelector(selectCartSubtotal)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const createOrder = useCreateOrder()
  const payOrder = usePayOrder()
  const { data: wallet } = useWallet(0, 1)

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [useWalletBalance, setUseWalletBalance] = useState(false)
  const [walletAmountInput, setWalletAmountInput] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' }, replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return null
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 py-32 text-center">
        <ShoppingBag className="h-12 w-12 text-gold" strokeWidth={1} />
        <h1 className="max-w-xl text-4xl font-medium text-ink md:text-5xl">Your Bag is Empty</h1>
        <p className="max-w-md text-ink/60">Add something you love before you check out.</p>
        <div className="gold-divider my-2" />
        <Button asChild size="lg">
          <Link to="/products">Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  const total = subtotal + SHIPPING_FEE
  const walletBalance = wallet?.balance ?? 0
  const maxRedeemable = Math.min(walletBalance, total)
  const parsedWalletAmount = Number.parseFloat(walletAmountInput)
  const appliedWalletAmount =
    useWalletBalance && Number.isFinite(parsedWalletAmount)
      ? Math.min(Math.max(parsedWalletAmount, 0), maxRedeemable)
      : 0
  const estimatedTotal = Math.max(total - appliedWalletAmount, 0)

  function handleToggleWallet(checked: boolean) {
    setUseWalletBalance(checked)
    if (checked && !walletAmountInput) {
      setWalletAmountInput(String(maxRedeemable))
    }
  }

  function buildOrderPayload(method: PaymentMethod) {
    return {
      addressId: selectedAddressId as string,
      paymentMethod: method,
      ...(appliedWalletAmount > 0 ? { useWalletAmount: appliedWalletAmount } : {}),
    }
  }

  function handlePlaceOrder() {
    if (!selectedAddressId) return

    if (paymentMethod === 'COD') {
      createOrder.mutate(buildOrderPayload('COD'), {
        onSuccess: (order) => {
          dispatch(clearCart())
          toast.success(`Order ${order.orderNumber} placed successfully.`)
          navigate(`/orders/${order.orderNumber}`)
        },
        onError: (error) => {
          toast.error(error?.message ?? 'Could not place your order. Please try again.')
        },
      })
      return
    }

    // ONLINE: create the order first, then run the mock payment step.
    createOrder.mutate(buildOrderPayload('ONLINE'), {
      onSuccess: (order) => {
        dispatch(clearCart())
        setIsProcessingPayment(true)
        setTimeout(() => {
          payOrder.mutate(order.orderNumber, {
            onSuccess: () => {
              setIsProcessingPayment(false)
              toast.success(`Payment confirmed for order ${order.orderNumber}.`)
              navigate(`/orders/${order.orderNumber}`)
            },
            onError: (error) => {
              setIsProcessingPayment(false)
              toast.error(
                error?.message ?? 'Payment could not be completed. Please complete payment from your order page.',
              )
              navigate(`/orders/${order.orderNumber}`)
            },
          })
        }, MOCK_PAYMENT_DELAY_MS)
      },
      onError: (error) => {
        toast.error(error?.message ?? 'Could not place your order. Please try again.')
      },
    })
  }

  return (
    <div className="section-padding mx-auto max-w-[1400px]">
      <div className="mb-12 flex flex-col items-center text-center">
        <RevealText as="span" className="eyebrow">
          Almost There
        </RevealText>
        <RevealText as="h1" delay={0.1} className="mt-4 text-4xl text-ink md:text-5xl">
          Checkout
        </RevealText>
        <div className="gold-divider mt-6" />
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-10">
          <AddressSection selectedAddressId={selectedAddressId} onSelect={setSelectedAddressId} />

          <section>
            <h2 className="font-serif text-xl text-ink">Payment Method</h2>
            <div className="mt-4 flex flex-col gap-3">
              <PaymentOptionCard
                title="Cash on Delivery"
                description="Pay when your order arrives."
                selected={paymentMethod === 'COD'}
                onSelect={() => setPaymentMethod('COD')}
              />
              <PaymentOptionCard
                title="Pay Online"
                description="Secure payment (demo)."
                selected={paymentMethod === 'ONLINE'}
                onSelect={() => setPaymentMethod('ONLINE')}
              />
            </div>
          </section>

          {walletBalance > 0 && (
            <section>
              <h2 className="font-serif text-xl text-ink">Wallet Balance</h2>
              <div className="mt-4 rounded-2xl border border-black/10 bg-white p-5">
                <label className="flex items-center justify-between gap-4">
                  <span className="text-sm text-ink">
                    Use wallet balance{' '}
                    <span className="text-ink/50">(available {formatPrice(walletBalance)})</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={useWalletBalance}
                    onChange={(e) => handleToggleWallet(e.target.checked)}
                    className="h-4 w-4 accent-[#c9a961]"
                  />
                </label>
                {useWalletBalance && (
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-sm text-ink/60">Amount to redeem</span>
                    <input
                      type="number"
                      min={0}
                      max={maxRedeemable}
                      value={walletAmountInput}
                      onChange={(e) => setWalletAmountInput(e.target.value)}
                      className="h-10 w-32 rounded-md border border-black/10 px-3 text-sm text-ink outline-none focus-visible:border-gold"
                    />
                    <span className="text-xs text-ink/40">Max {formatPrice(maxRedeemable)}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          <section>
            <h2 className="font-serif text-xl text-ink">Order Review</h2>
            <div className="mt-4 flex flex-col divide-y divide-black/5">
              {items.map((item) => {
                const unitPrice = item.product.discountedPrice ?? item.product.basePrice
                return (
                  <div key={item.productId} className="flex gap-4 py-4">
                    <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-white">
                      <img
                        src={
                          item.product.primaryImageUrl ??
                          '/images/products/product-necklaces.jpg'
                        }
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-center">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-ink/40">
                        {item.product.ornamentId}
                      </span>
                      <h3 className="font-serif text-base text-ink">{item.product.name}</h3>
                      <p className="mt-1 text-sm text-ink/60">
                        Qty {item.quantity} × {formatPrice(unitPrice)}
                      </p>
                    </div>
                    <div className="shrink-0 self-center text-right font-medium text-ink">
                      {formatPrice(unitPrice * item.quantity)}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        <div className="h-max rounded-2xl border border-black/5 bg-white p-8 shadow-[0_2px_8px_rgba(10,10,10,0.04),0_12px_32px_-12px_rgba(10,10,10,0.12)]">
          <h2 className="font-serif text-xl text-ink">Order Summary</h2>
          <div className="mt-6 flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between text-ink/70">
              <span>Items ({itemCount})</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-ink/70">
              <span>Shipping</span>
              <span>{formatPrice(SHIPPING_FEE)}</span>
            </div>
            {appliedWalletAmount > 0 && (
              <div className="flex items-center justify-between text-emerald-700">
                <span>Wallet Credit</span>
                <span>-{formatPrice(appliedWalletAmount)}</span>
              </div>
            )}
          </div>
          <div className="gold-divider my-6 w-full" />
          <div className="flex items-center justify-between font-serif text-lg text-ink">
            <span>{appliedWalletAmount > 0 ? 'Estimated Total' : 'Total'}</span>
            <span>{formatPrice(estimatedTotal)}</span>
          </div>
          {appliedWalletAmount > 0 && (
            <p className="mt-2 text-xs text-ink/40">Estimate — the server confirms the final total on checkout.</p>
          )}
          <Button
            type="button"
            size="lg"
            className="mt-8 w-full"
            disabled={!selectedAddressId || createOrder.isPending || isProcessingPayment}
            onClick={handlePlaceOrder}
          >
            {createOrder.isPending
              ? 'Placing Order…'
              : isProcessingPayment
                ? 'Processing…'
                : 'Place Order'}
          </Button>
          {!selectedAddressId && (
            <p className="mt-3 text-center text-xs text-ink/50">Select a shipping address to continue.</p>
          )}
        </div>
      </div>

      {isProcessingPayment && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-ink/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-white px-10 py-8 shadow-xl">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
            <p className="font-serif text-base text-ink">Processing your payment…</p>
          </div>
        </div>
      )}
    </div>
  )
}
