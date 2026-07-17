import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Copy, Gift, Wallet as WalletIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useWallet } from '@/hooks/useWallet'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { RevealText } from '@/components/common/RevealText'
import { formatDate, formatPrice } from '@/lib/utils'
import type { WalletTransaction } from '@/types/api'

const PAGE_SIZE = 20

function TransactionRow({ transaction }: { transaction: WalletTransaction }) {
  const isCredit = transaction.amount >= 0
  return (
    <div className="flex items-center justify-between gap-4 border-b border-black/5 py-4 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate text-sm text-ink">{transaction.description}</p>
        <p className="mt-1 text-xs text-ink/45">
          {formatDate(transaction.createdDate)}
          {transaction.referenceOrderNumber && <> · Order {transaction.referenceOrderNumber}</>}
        </p>
      </div>
      <div className={`shrink-0 font-serif text-base ${isCredit ? 'text-emerald-700' : 'text-red-600'}`}>
        {isCredit ? '+' : ''}
        {formatPrice(transaction.amount)}
      </div>
    </div>
  )
}

export default function WalletPage() {
  const { isAuthenticated } = useAuth()
  const [page, setPage] = useState(0)
  const { data: currentUser } = useCurrentUser()
  const { data, isLoading, isError } = useWallet(page, PAGE_SIZE)

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 py-32 text-center">
        <WalletIcon className="h-12 w-12 text-gold" strokeWidth={1} />
        <h1 className="max-w-xl text-4xl font-medium text-ink md:text-5xl">Your Wallet</h1>
        <p className="max-w-md text-ink/60">Sign in to view your wallet balance, rewards, and referral code.</p>
        <div className="gold-divider my-2" />
        <Button asChild size="lg">
          <Link to="/login" state={{ from: '/wallet' }}>
            Sign In
          </Link>
        </Button>
      </div>
    )
  }

  function handleCopyReferralCode() {
    if (!currentUser?.referralCode) return
    navigator.clipboard
      .writeText(currentUser.referralCode)
      .then(() => toast.success('Referral code copied.'))
      .catch(() => toast.error('Could not copy the code. Please copy it manually.'))
  }

  return (
    <div className="section-padding mx-auto max-w-[1100px]">
      <div className="mb-14 flex flex-col items-center text-center">
        <RevealText as="span" className="eyebrow">
          Your Account
        </RevealText>
        <RevealText as="h1" delay={0.1} className="mt-4 text-4xl text-ink md:text-5xl">
          Wallet &amp; Rewards
        </RevealText>
        <div className="gold-divider mt-6" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-8">
          {/* Balance */}
          <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-ink to-ink-soft p-8 text-center shadow-[0_12px_32px_-12px_rgba(10,10,10,0.4)]">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold/80">Wallet Balance</p>
            {isLoading ? (
              <Skeleton className="mx-auto mt-4 h-10 w-40 bg-white/10" />
            ) : isError || !data ? (
              <p className="mt-4 text-sm text-ivory/60">Could not load your balance right now.</p>
            ) : (
              <p className="mt-3 font-serif text-5xl text-ivory">{formatPrice(data.balance)}</p>
            )}
          </div>

          {/* Transaction history */}
          <section>
            <h2 className="font-serif text-xl text-ink">Transaction History</h2>
            {isLoading ? (
              <div className="mt-4 flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : isError || !data ? (
              <p className="mt-4 text-sm text-ink/60">Could not load your transactions right now.</p>
            ) : data.transactions.content.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-black/5 bg-white p-8 text-center text-sm text-ink/50">
                No wallet activity yet — earn rewards on every purchase.
              </p>
            ) : (
              <div className="mt-4 rounded-2xl border border-black/5 bg-white px-6 shadow-[0_2px_8px_rgba(10,10,10,0.04)]">
                {data.transactions.content.map((transaction) => (
                  <TransactionRow key={transaction.id} transaction={transaction} />
                ))}
              </div>
            )}

            {data && data.transactions.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={data.transactions.first ?? page === 0}
                  className="gap-1"
                >
                  <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} /> Previous
                </Button>
                <span className="text-sm text-ink/60">
                  Page {page + 1} of {data.transactions.totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.transactions.totalPages - 1, p + 1))}
                  disabled={data.transactions.last ?? page >= data.transactions.totalPages - 1}
                  className="gap-1"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Button>
              </div>
            )}
          </section>
        </div>

        {/* Referral */}
        <div className="h-max rounded-2xl border border-black/5 bg-white p-8 shadow-[0_2px_8px_rgba(10,10,10,0.04),0_12px_32px_-12px_rgba(10,10,10,0.12)]">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-gold" strokeWidth={1.5} />
            <h2 className="font-serif text-xl text-ink">Refer &amp; Earn</h2>
          </div>
          <p className="mt-3 text-sm text-ink/60">
            Share this code — you and your friend both get ₹100 when they place their first order.
          </p>
          {currentUser?.referralCode ? (
            <div className="mt-6 flex items-center justify-between gap-3 rounded-full border border-gold/40 bg-gold/5 py-2 pl-6 pr-2">
              <span className="truncate font-mono text-sm tracking-wider text-ink">{currentUser.referralCode}</span>
              <button
                type="button"
                onClick={handleCopyReferralCode}
                aria-label="Copy referral code"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-ink transition-colors hover:bg-gold-dark"
              >
                <Copy className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          ) : (
            <Skeleton className="mt-6 h-11 w-full rounded-full" />
          )}
        </div>
      </div>
    </div>
  )
}
