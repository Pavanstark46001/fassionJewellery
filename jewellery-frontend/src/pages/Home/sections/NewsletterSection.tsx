import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Mail } from 'lucide-react'
import { RevealText } from '@/components/common/RevealText'
import { MagneticButton } from '@/components/common/MagneticButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { isValidEmail } from '@/lib/utils'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    if (!isValidEmail(email)) {
      setError("That email address doesn't look quite right.")
      return
    }

    setError(null)
    toast.success('Welcome to the inner circle.', {
      description: 'Look out for early access and exclusive offers in your inbox.',
    })
    setEmail('')
  }

  return (
    <section className="section-padding bg-ink">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/40">
          <Mail className="h-5 w-5 text-gold" strokeWidth={1.5} />
        </span>

        <RevealText as="h2" className="mt-6 text-4xl text-ivory md:text-5xl">
          Join the Inner Circle
        </RevealText>
        <RevealText as="p" delay={0.1} className="mt-4 max-w-md text-sm leading-relaxed text-ivory/60">
          Be the first to know about new collections, private sales, and styling stories &mdash;
          delivered straight to your inbox.
        </RevealText>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-10 flex w-full max-w-md flex-col items-center gap-3 sm:flex-row"
        >
          <div className="w-full flex-1">
            <Input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (error) setError(null)
              }}
              placeholder="Your email address"
              aria-label="Email address"
              aria-invalid={Boolean(error)}
              className="border-white/15 bg-white/5 text-ivory placeholder:text-ivory/40 focus-visible:border-gold"
            />
          </div>
          <MagneticButton strength={20} className="w-full sm:w-auto">
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Subscribe
            </Button>
          </MagneticButton>
        </form>
        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      </div>
    </section>
  )
}
