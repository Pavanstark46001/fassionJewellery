import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RevealText } from '@/components/common/RevealText'
import { useLogin } from '@/hooks/useAuthMutations'
import { useAuth } from '@/hooks/useAuth'
import { isValidEmail } from '@/lib/utils'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isAdmin } = useAuth()
  const login = useLogin()

  const explicitFrom = (location.state as { from?: string } | null)?.from
  const redirectTo = explicitFrom ?? (isAdmin ? '/admin' : '/')

  useEffect(() => {
    if (isAuthenticated) navigate(redirectTo, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin])

  function validate() {
    const next: { email?: string; password?: string } = {}
    if (!isValidEmail(email)) next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Password is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!validate()) return

    login.mutate(
      { email: email.trim(), password },
      {
        onSuccess: (data) => {
          toast.success('Welcome back.')
          navigate(explicitFrom ?? (data.roles?.includes('ADMIN') ? '/admin' : '/'), { replace: true })
        },
        onError: (error) => {
          toast.error(error?.message ?? 'Could not sign in. Please try again.')
        },
      },
    )
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-32">
      <div className="w-full max-w-md">
        <div className="mb-10 flex flex-col items-center text-center">
          <RevealText as="span" className="eyebrow">
            Welcome Back
          </RevealText>
          <RevealText as="h1" delay={0.1} className="mt-4 text-4xl text-ink md:text-5xl">
            Sign In
          </RevealText>
          <div className="gold-divider mt-6" />
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <div>
            <Input
              type="email"
              placeholder="Email address"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <p className="mt-2 pl-2 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <Input
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(errors.password)}
            />
            {errors.password && <p className="mt-2 pl-2 text-xs text-red-600">{errors.password}</p>}
          </div>

          <Button type="submit" size="lg" disabled={login.isPending} className="mt-2">
            {login.isPending ? 'Signing In…' : 'Sign In'}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-ink/60">
          New to Sri Sai Fashion Jewellery?{' '}
          <Link to="/register" state={location.state} className="text-gold-dark underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
