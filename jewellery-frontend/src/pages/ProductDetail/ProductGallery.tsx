import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ProductImage } from '@/types/api'

const FALLBACK_IMAGE = '/images/products/product-necklaces.jpg'

interface ProductGalleryProps {
  images: ProductImage[]
  primaryImageUrl: string | null
  name: string
}

export function ProductGallery({ images, primaryImageUrl, name }: ProductGalleryProps) {
  const gallery = images.length > 0 ? images.map((img) => img.imageUrl) : [primaryImageUrl ?? FALLBACK_IMAGE]
  const [activeIndex, setActiveIndex] = useState(0)
  const activeSrc = gallery[activeIndex] ?? FALLBACK_IMAGE

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(10,10,10,0.04),0_12px_32px_-12px_rgba(10,10,10,0.12)]">
        <img
          src={activeSrc}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110"
        />
      </div>

      {gallery.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {gallery.map((src, index) => (
            <button
              key={src + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                'h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                index === activeIndex ? 'border-gold' : 'border-transparent opacity-70 hover:opacity-100',
              )}
            >
              <img src={src} alt={`${name} thumbnail ${index + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
