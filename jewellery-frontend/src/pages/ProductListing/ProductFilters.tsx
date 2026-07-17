import { useState } from 'react'
import { X } from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'
import { useCollections } from '@/hooks/useCollections'
import { useOccasions } from '@/hooks/useOccasions'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatMetalType } from '@/lib/metalType'
import type { MetalType } from '@/types/api'

const METAL_TYPE_VALUES: MetalType[] = [
  'GOLD_PLATED',
  'ROSE_GOLD_PLATED',
  'SILVER_PLATED',
  'PLATINUM_PLATED',
  'OXIDIZED',
  'BRASS',
  'OTHER',
]

export interface ActiveFilters {
  categorySlug?: string
  collectionSlug?: string
  occasionSlug?: string
  minPrice?: string
  maxPrice?: string
  metalType?: string
}

interface ProductFiltersProps {
  filters: ActiveFilters
  onChange: (patch: Partial<ActiveFilters>) => void
  onClear: () => void
  /** When set, renders as a slide-over panel with a close button (mobile). */
  onRequestClose?: () => void
}

function FilterList({
  items,
  activeSlug,
  onSelect,
}: {
  items: { slug: string; name: string }[]
  activeSlug?: string
  onSelect: (slug: string | undefined) => void
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item) => (
        <button
          key={item.slug}
          type="button"
          onClick={() => onSelect(activeSlug === item.slug ? undefined : item.slug)}
          className={cn(
            'flex items-center gap-2.5 text-left text-sm transition-colors',
            activeSlug === item.slug ? 'font-medium text-gold-dark' : 'text-ink/65 hover:text-ink',
          )}
        >
          <span
            className={cn(
              'h-3.5 w-3.5 shrink-0 rounded-full border transition-colors',
              activeSlug === item.slug ? 'border-gold bg-gold' : 'border-ink/25',
            )}
          />
          {item.name}
        </button>
      ))}
    </div>
  )
}

export function ProductFilters({ filters, onChange, onClear, onRequestClose }: ProductFiltersProps) {
  const { data: categories, isLoading: loadingCategories } = useCategories()
  const { data: collections, isLoading: loadingCollections } = useCollections()
  const { data: occasions, isLoading: loadingOccasions } = useOccasions()

  const [minPrice, setMinPrice] = useState(filters.minPrice ?? '')
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice ?? '')

  const hasActiveFilters = Boolean(
    filters.categorySlug || filters.collectionSlug || filters.occasionSlug || filters.minPrice ||
      filters.maxPrice || filters.metalType,
  )

  function applyPriceRange() {
    onChange({ minPrice: minPrice || undefined, maxPrice: maxPrice || undefined })
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-xl text-ink">Filters</h2>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button type="button" onClick={onClear} className="text-xs uppercase tracking-wider text-gold-dark underline underline-offset-4">
              Clear All
            </button>
          )}
          {onRequestClose && (
            <button type="button" aria-label="Close filters" onClick={onRequestClose} className="lg:hidden">
              <X className="h-5 w-5 text-ink/60" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      <Accordion type="multiple" defaultValue={['category', 'price', 'metal']}>
        <AccordionItem value="category">
          <AccordionTrigger className="py-4 text-base">Category</AccordionTrigger>
          <AccordionContent>
            {loadingCategories ? (
              <p className="text-sm text-ink/40">Loading…</p>
            ) : (
              <FilterList
                items={categories ?? []}
                activeSlug={filters.categorySlug}
                onSelect={(slug) => onChange({ categorySlug: slug })}
              />
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="collection">
          <AccordionTrigger className="py-4 text-base">Collection</AccordionTrigger>
          <AccordionContent>
            {loadingCollections ? (
              <p className="text-sm text-ink/40">Loading…</p>
            ) : (
              <FilterList
                items={collections ?? []}
                activeSlug={filters.collectionSlug}
                onSelect={(slug) => onChange({ collectionSlug: slug })}
              />
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="occasion">
          <AccordionTrigger className="py-4 text-base">Occasion</AccordionTrigger>
          <AccordionContent>
            {loadingOccasions ? (
              <p className="text-sm text-ink/40">Loading…</p>
            ) : (
              <FilterList
                items={occasions ?? []}
                activeSlug={filters.occasionSlug}
                onSelect={(slug) => onChange({ occasionSlug: slug })}
              />
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger className="py-4 text-base">Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={0}
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                onBlur={applyPriceRange}
                className="h-10 px-4"
              />
              <span className="text-ink/40">&mdash;</span>
              <Input
                type="number"
                min={0}
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onBlur={applyPriceRange}
                className="h-10 px-4"
              />
            </div>
            <Button type="button" size="sm" variant="outline" className="mt-3 w-full" onClick={applyPriceRange}>
              Apply
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="metal">
          <AccordionTrigger className="py-4 text-base">Metal Type</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2.5">
              {METAL_TYPE_VALUES.map((value) => {
                const checked = filters.metalType === value
                return (
                  <label key={value} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink/70">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onChange({ metalType: checked ? undefined : value })}
                      className="h-4 w-4 rounded border-ink/25 accent-[#c9a961]"
                    />
                    {formatMetalType(value)}
                  </label>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
