import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectCartItemCount, selectCartItems, selectCartSubtotal, updateCartQuantity, removeFromCart } from '@/store/cartSlice'
import { Button } from '@/components/ui/button'
import { RevealText } from '@/components/common/RevealText'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const items = useAppSelector(selectCartItems)
  const itemCount = useAppSelector(selectCartItemCount)
  const subtotal = useAppSelector(selectCartSubtotal)
  const dispatch = useAppDispatch()

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 py-32 text-center">
        <ShoppingBag className="h-12 w-12 text-gold" strokeWidth={1} />
        <h1 className="max-w-xl text-4xl font-medium text-ink md:text-5xl">Your Bag is Empty</h1>
        <p className="max-w-md text-ink/60">
          Discover pieces you'll love and add them to your bag to see them here.
        </p>
        <div className="gold-divider my-2" />
        <Button asChild size="lg">
          <Link to="/products">Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="section-padding mx-auto max-w-[1400px]">
      <div className="mb-12 flex flex-col items-center text-center">
        <RevealText as="span" className="eyebrow">
          Review &amp; Confirm
        </RevealText>
        <RevealText as="h1" delay={0.1} className="mt-4 text-4xl text-ink md:text-5xl">
          Your Bag
        </RevealText>
        <div className="gold-divider mt-6" />
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col divide-y divide-black/5">
          {items.map((item) => {
            const unitPrice = item.product.discountedPrice ?? item.product.basePrice
            return (
              <div key={item.productId} className="flex gap-5 py-6">
                <Link
                  to={`/products/${item.product.slug}`}
                  className="h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-white"
                >
                  <img
                    src={
                      item.product.primaryImageUrl ??
                      '/images/products/product-necklaces.jpg'
                    }
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                </Link>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-ink/40">
                      {item.product.ornamentId}
                    </span>
                    <Link to={`/products/${item.product.slug}`}>
                      <h3 className="font-serif text-lg text-ink hover:text-gold-dark">{item.product.name}</h3>
                    </Link>
                    <p className="mt-1 text-sm text-ink/60">{formatPrice(unitPrice)} each</p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-black/10">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() =>
                          dispatch(updateCartQuantity(item.productId, Math.max(1, item.quantity - 1)))
                        }
                        className="flex h-9 w-9 items-center justify-center text-ink/70 hover:text-gold-dark disabled:opacity-30"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                      <span className="w-8 text-center text-sm text-ink">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => dispatch(updateCartQuantity(item.productId, item.quantity + 1))}
                        className="flex h-9 w-9 items-center justify-center text-ink/70 hover:text-gold-dark"
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                    </div>

                    <button
                      type="button"
                      aria-label="Remove item"
                      onClick={() => dispatch(removeFromCart(item.productId))}
                      className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-ink/50 transition-colors hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} /> Remove
                    </button>
                  </div>
                </div>

                <div className="hidden shrink-0 text-right font-medium text-ink sm:block">
                  {formatPrice(unitPrice * item.quantity)}
                </div>
              </div>
            )
          })}
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
              <span className="text-gold-dark">Calculated at checkout</span>
            </div>
          </div>
          <div className="gold-divider my-6 w-full" />
          <div className="flex items-center justify-between font-serif text-lg text-ink">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <Button asChild size="lg" className="mt-8 w-full">
            <Link to="/checkout">Proceed to Checkout</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="mt-3 w-full">
            <Link to="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
