import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RevealText } from '@/components/common/RevealText'
import { useRegister } from '@/hooks/useAuthMutations'
import { useAuth } from '@/hooks/useAuth'
import { isValidEmail } from '@/lib/utils'

interface FormState {
  fullName: string
  email: string
  phoneNumber: string
  password: string
  confirmPassword: string
  referralCode: string
}

const initialForm: FormState = {
  fullName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  referralCode: '',
}

export default function RegisterPage() {
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState<FormState>(() => ({
    ...initialForm,
    referralCode: searchParams.get('ref') ?? '',
  }))
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const register = useRegister()

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'

  useEffect(() => {
    if (isAuthenticated) navigate(redirectTo, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function validate() {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (form.fullName.trim().length < 2) next.fullName = 'Enter your full name.'
    if (!isValidEmail(form.email)) next.email = 'Enter a valid email address.'
    if (!/^[0-9+\s-]{7,15}$/.test(form.phoneNumber.trim())) next.phoneNumber = 'Enter a valid phone number.'
    if (form.password.length < 8) next.password = 'Password must be at least 8 characters.'
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!validate()) return

    const referralCode = form.referralCode.trim()

    register.mutate(
      {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
        ...(referralCode ? { referralCode } : {}),
      },
      {
        onSuccess: () => {
          toast.success('Account created — welcome to Sri Sai Fashion Jewellery.')
          navigate(redirectTo, { replace: true })
        },
        onError: (error) => {
          toast.error(error?.message ?? 'Could not create your account. Please try again.')
        },
      },
    )
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-32">
      <div className="w-full max-w-md">
        <div className="mb-10 flex flex-col items-center text-center">
          <RevealText as="span" className="eyebrow">
            Join Us
          </RevealText>
          <RevealText as="h1" delay={0.1} className="mt-4 text-4xl text-ink md:text-5xl">
            Create Account
          </RevealText>
          <div className="gold-divider mt-6" />
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <div>
            <Input
              placeholder="Full name"
              autoComplete="name"
              value={form.fullName}
              onChange={(e) => update('fullName', e.target.value)}
              aria-invalid={Boolean(errors.fullName)}
            />
            {errors.fullName && <p className="mt-2 pl-2 text-xs text-red-600">{errors.fullName}</p>}
          </div>

          <div>
            <Input
              type="email"
              placeholder="Email address"
              autoComplete="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <p className="mt-2 pl-2 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <Input
              type="tel"
              placeholder="Phone number"
              autoComplete="tel"
              value={form.phoneNumber}
              onChange={(e) => update('phoneNumber', e.target.value)}
              aria-invalid={Boolean(errors.phoneNumber)}
            />
            {errors.phoneNumber && <p className="mt-2 pl-2 text-xs text-red-600">{errors.phoneNumber}</p>}
          </div>

          <div>
            <Input
              type="password"
              placeholder="Password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              aria-invalid={Boolean(errors.password)}
            />
            {errors.password && <p className="mt-2 pl-2 text-xs text-red-600">{errors.password}</p>}
          </div>

          <div>
            <Input
              type="password"
              placeholder="Confirm password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              aria-invalid={Boolean(errors.confirmPassword)}
            />
            {errors.confirmPassword && (
              <p className="mt-2 pl-2 text-xs text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <div>
            <Input
              placeholder="Referral code (optional)"
              value={form.referralCode}
              onChange={(e) => update('referralCode', e.target.value.toUpperCase())}
              className="uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal"
            />
            <p className="mt-2 pl-2 text-xs text-ink/45">
              Have a friend's code? Enter it and you'll both earn wallet credit on your first order.
            </p>
          </div>

          <Button type="submit" size="lg" disabled={register.isPending} className="mt-2">
            {register.isPending ? 'Creating Account…' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-ink/60">
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="text-gold-dark underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
