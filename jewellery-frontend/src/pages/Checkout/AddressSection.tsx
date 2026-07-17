import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAddresses, useCreateAddress } from '@/hooks/useAddresses'
import type { Address, CreateAddressPayload } from '@/types/api'

interface AddressSectionProps {
  selectedAddressId: string | null
  onSelect: (addressId: string) => void
}

interface AddressFormState {
  fullName: string
  phoneNumber: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

const EMPTY_FORM: AddressFormState = {
  fullName: '',
  phoneNumber: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  isDefault: false,
}

function AddressCard({
  address,
  selected,
  onSelect,
}: {
  address: Address
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
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-serif text-base text-ink">
          <span
            className={cn(
              'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
              selected ? 'border-gold' : 'border-black/30',
            )}
          >
            {selected && <span className="h-2 w-2 rounded-full bg-gold" />}
          </span>
          {address.fullName}
        </span>
        {address.isDefault && (
          <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-dark">
            Default
          </span>
        )}
      </div>
      <p className="pl-6 text-sm text-ink/70">
        {address.addressLine1}
        {address.addressLine2 ? `, ${address.addressLine2}` : ''}, {address.city}, {address.state}{' '}
        {address.postalCode}, {address.country}
      </p>
      <p className="pl-6 text-sm text-ink/50">{address.phoneNumber}</p>
    </button>
  )
}

export function AddressSection({ selectedAddressId, onSelect }: AddressSectionProps) {
  const { data: addresses, isLoading } = useAddresses()
  const createAddress = useCreateAddress()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY_FORM, string>>>({})

  // Pre-select the default saved address (or the first one) once addresses load.
  useEffect(() => {
    if (!addresses || addresses.length === 0 || selectedAddressId) return
    const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0]
    onSelect(defaultAddress.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses])

  function updateField<K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function validate() {
    const next: Partial<Record<keyof typeof EMPTY_FORM, string>> = {}
    if (!form.fullName.trim()) next.fullName = 'Required'
    if (!/^\d{10}$/.test(form.phoneNumber.trim())) next.phoneNumber = 'Enter a valid 10-digit number'
    if (!form.addressLine1.trim()) next.addressLine1 = 'Required'
    if (!form.city.trim()) next.city = 'Required'
    if (!form.state.trim()) next.state = 'Required'
    if (!/^\d{6}$/.test(form.postalCode.trim())) next.postalCode = 'Enter a valid 6-digit PIN'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!validate()) return

    const payload: CreateAddressPayload = {
      fullName: form.fullName.trim(),
      phoneNumber: form.phoneNumber.trim(),
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim() || undefined,
      city: form.city.trim(),
      state: form.state.trim(),
      postalCode: form.postalCode.trim(),
      country: form.country.trim() || 'India',
      isDefault: form.isDefault,
    }

    createAddress.mutate(payload, {
      onSuccess: (address) => {
        toast.success('Address saved.')
        onSelect(address.id)
        setShowForm(false)
        setForm(EMPTY_FORM)
        setErrors({})
      },
      onError: (error) => {
        toast.error(error?.message ?? 'Could not save address. Please try again.')
      },
    })
  }

  return (
    <section>
      <h2 className="font-serif text-xl text-ink">Shipping Address</h2>

      {isLoading ? (
        <div className="mt-4 flex flex-col gap-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : addresses && addresses.length > 0 ? (
        <div className="mt-4 flex flex-col gap-3">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              selected={selectedAddressId === address.id}
              onSelect={() => onSelect(address.id)}
            />
          ))}
        </div>
      ) : (
        !showForm && <p className="mt-4 text-sm text-ink/60">You don't have any saved addresses yet.</p>
      )}

      {!showForm && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4 gap-1.5"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} /> Add New Address
        </Button>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-5 flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Input
                placeholder="Full name"
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                aria-invalid={Boolean(errors.fullName)}
              />
              {errors.fullName && <p className="mt-1.5 pl-2 text-xs text-red-600">{errors.fullName}</p>}
            </div>
            <div>
              <Input
                placeholder="Phone number"
                value={form.phoneNumber}
                onChange={(e) => updateField('phoneNumber', e.target.value)}
                aria-invalid={Boolean(errors.phoneNumber)}
              />
              {errors.phoneNumber && <p className="mt-1.5 pl-2 text-xs text-red-600">{errors.phoneNumber}</p>}
            </div>
          </div>

          <div>
            <Input
              placeholder="Address line 1"
              value={form.addressLine1}
              onChange={(e) => updateField('addressLine1', e.target.value)}
              aria-invalid={Boolean(errors.addressLine1)}
            />
            {errors.addressLine1 && <p className="mt-1.5 pl-2 text-xs text-red-600">{errors.addressLine1}</p>}
          </div>

          <Input
            placeholder="Address line 2 (optional)"
            value={form.addressLine2}
            onChange={(e) => updateField('addressLine2', e.target.value)}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Input
                placeholder="City"
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                aria-invalid={Boolean(errors.city)}
              />
              {errors.city && <p className="mt-1.5 pl-2 text-xs text-red-600">{errors.city}</p>}
            </div>
            <div>
              <Input
                placeholder="State"
                value={form.state}
                onChange={(e) => updateField('state', e.target.value)}
                aria-invalid={Boolean(errors.state)}
              />
              {errors.state && <p className="mt-1.5 pl-2 text-xs text-red-600">{errors.state}</p>}
            </div>
            <div>
              <Input
                placeholder="Postal code"
                value={form.postalCode}
                onChange={(e) => updateField('postalCode', e.target.value)}
                aria-invalid={Boolean(errors.postalCode)}
              />
              {errors.postalCode && <p className="mt-1.5 pl-2 text-xs text-red-600">{errors.postalCode}</p>}
            </div>
          </div>

          <Input
            placeholder="Country"
            value={form.country}
            onChange={(e) => updateField('country', e.target.value)}
          />

          <label className="flex items-center gap-2 pl-1 text-sm text-ink/70">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => updateField('isDefault', e.target.checked)}
              className="h-4 w-4 rounded border-black/20 accent-gold"
            />
            Set as default address
          </label>

          <div className="flex gap-3">
            <Button type="submit" size="sm" disabled={createAddress.isPending}>
              {createAddress.isPending ? 'Saving…' : 'Save Address'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false)
                setErrors({})
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </section>
  )
}
