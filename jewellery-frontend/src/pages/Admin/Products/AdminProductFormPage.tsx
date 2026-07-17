import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { useAdminProduct, useCreateAdminProduct, useUpdateAdminProduct } from '@/hooks/admin/useAdminProducts'
import { useAdminSubCategories } from '@/hooks/admin/useAdminCategories'
import { useCategories } from '@/hooks/useCategories'
import { useCollections } from '@/hooks/useCollections'
import { useOccasions } from '@/hooks/useOccasions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import type { AdminMetalType, AdminProductImagePayload, AdminProductPayload, StockStatus } from '@/types/admin'

const METAL_TYPE_OPTIONS: { value: AdminMetalType; label: string }[] = [
  { value: 'GOLD_PLATED', label: 'Gold Plated' },
  { value: 'ROSE_GOLD_PLATED', label: 'Rose Gold Plated' },
  { value: 'SILVER', label: 'Silver' },
  { value: 'PLATINUM_PLATED', label: 'Platinum Plated' },
  { value: 'OXIDIZED', label: 'Oxidized' },
  { value: 'BRASS', label: 'Brass' },
  { value: 'CZ', label: 'CZ' },
]

const STOCK_STATUS_OPTIONS: { value: StockStatus; label: string }[] = [
  { value: 'IN_STOCK', label: 'In Stock' },
  { value: 'LOW_STOCK', label: 'Low Stock' },
  { value: 'OUT_OF_STOCK', label: 'Out of Stock' },
  { value: 'COMING_SOON', label: 'Coming Soon' },
]

const inputClass = 'h-10 rounded-md px-3'
const labelClass = 'mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/50'

interface ImageRow extends AdminProductImagePayload {
  key: string
}

function emptyImageRow(): ImageRow {
  return { key: crypto.randomUUID(), imageUrl: '', altText: '', isPrimary: false }
}

export default function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const { data: product, isLoading: loadingProduct } = useAdminProduct(id)
  const { data: categories } = useCategories(false)
  const { data: collections } = useCollections()
  const { data: occasions } = useOccasions()
  const createProduct = useCreateAdminProduct()
  const updateProduct = useUpdateAdminProduct()

  const [name, setName] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [discountedPrice, setDiscountedPrice] = useState('')
  const [metalType, setMetalType] = useState<AdminMetalType>('GOLD_PLATED')
  const [weightGrams, setWeightGrams] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [subCategoryId, setSubCategoryId] = useState('')
  const [stockStatus, setStockStatus] = useState<StockStatus>('IN_STOCK')
  const [isActive, setIsActive] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [images, setImages] = useState<ImageRow[]>([emptyImageRow()])
  const [collectionIds, setCollectionIds] = useState<string[]>([])
  const [occasionIds, setOccasionIds] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: subCategories } = useAdminSubCategories(categoryId || undefined)

  // Prefill when editing and the product + reference lists have loaded.
  useEffect(() => {
    if (!product) return
    setName(product.name)
    setShortDescription(product.shortDescription ?? '')
    setDescription(product.description ?? '')
    setBasePrice(String(product.basePrice))
    setDiscountedPrice(product.discountedPrice != null ? String(product.discountedPrice) : '')
    setMetalType(product.metalType)
    setWeightGrams(product.weightGrams != null ? String(product.weightGrams) : '')
    setCategoryId(product.categoryId)
    setSubCategoryId(product.subCategoryId ?? '')
    setStockStatus(product.stockStatus)
    setIsActive(product.isActive)
    setIsFeatured(product.isFeatured)
    setMetaTitle(product.metaTitle ?? '')
    setMetaDescription(product.metaDescription ?? '')
    setImages(
      product.images.length > 0
        ? product.images.map((img) => ({
            key: img.id,
            imageUrl: img.imageUrl,
            altText: img.altText ?? '',
            displayOrder: img.displayOrder ?? undefined,
            isPrimary: img.isPrimary,
          }))
        : [emptyImageRow()],
    )
  }, [product])

  // Resolve collection/occasion slugs (from the detail DTO) into ids once the reference lists load.
  useEffect(() => {
    if (!product || !collections) return
    setCollectionIds(collections.filter((c) => product.collectionSlugs.includes(c.slug)).map((c) => c.id))
  }, [product, collections])

  useEffect(() => {
    if (!product || !occasions) return
    setOccasionIds(occasions.filter((o) => product.occasionSlugs.includes(o.slug)).map((o) => o.id))
  }, [product, occasions])

  function updateImageRow(key: string, patch: Partial<ImageRow>) {
    setImages((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  }

  function setPrimaryImage(key: string) {
    setImages((rows) => rows.map((row) => ({ ...row, isPrimary: row.key === key })))
  }

  function addImageRow() {
    setImages((rows) => [...rows, emptyImageRow()])
  }

  function removeImageRow(key: string) {
    setImages((rows) => (rows.length > 1 ? rows.filter((row) => row.key !== key) : rows))
  }

  function toggleId(list: string[], id: string): string[] {
    return list.includes(id) ? list.filter((v) => v !== id) : [...list, id]
  }

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Name is required.'
    if (!basePrice || Number(basePrice) <= 0) next.basePrice = 'Enter a valid base price.'
    if (!categoryId) next.categoryId = 'Select a category.'
    const validImages = images.filter((row) => row.imageUrl.trim())
    if (validImages.length === 0) next.images = 'Add at least one image URL.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const validImages = images.filter((row) => row.imageUrl.trim())
    const hasPrimary = validImages.some((row) => row.isPrimary)
    const payloadImages = validImages.map((row, index) => ({
      imageUrl: row.imageUrl.trim(),
      altText: row.altText?.trim() || undefined,
      displayOrder: index + 1,
      isPrimary: hasPrimary ? row.isPrimary : index === 0,
    }))

    const payload: AdminProductPayload = {
      name: name.trim(),
      shortDescription: shortDescription.trim() || undefined,
      description: description.trim() || undefined,
      basePrice: Number(basePrice),
      discountedPrice: discountedPrice ? Number(discountedPrice) : null,
      metalType,
      weightGrams: weightGrams ? Number(weightGrams) : null,
      categoryId,
      subCategoryId: subCategoryId || null,
      isActive,
      isFeatured,
      stockStatus,
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
      images: payloadImages,
      collectionIds,
      occasionIds,
    }

    const onSuccess = () => {
      toast.success(isEdit ? 'Product updated.' : 'Product created.')
      navigate('/admin/products')
    }
    const onError = (error: { message?: string }) =>
      toast.error(error?.message ?? 'Could not save this product.')

    if (isEdit && id) {
      updateProduct.mutate({ id, payload }, { onSuccess, onError })
    } else {
      createProduct.mutate(payload, { onSuccess, onError })
    }
  }

  const isSaving = createProduct.isPending || updateProduct.isPending

  if (isEdit && loadingProduct) {
    return <Skeleton className="h-96 w-full" />
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">{isEdit ? 'Edit Product' : 'New Product'}</h1>
        <p className="mt-1 text-sm text-ink/50">
          <Link to="/admin/products" className="text-gold-dark underline underline-offset-4">
            Products
          </Link>{' '}
          / {isEdit ? 'Edit' : 'New'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <section className="rounded-lg border border-black/10 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/60">Basics</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelClass}>Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Short Description</label>
              <Input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-black/15 px-3 py-2 text-sm text-ink outline-none focus-visible:border-gold-dark focus-visible:ring-2 focus-visible:ring-gold/20"
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/60">Pricing &amp; Material</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className={labelClass}>Base Price (₹) *</label>
              <Input type="number" min={0} step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className={inputClass} />
              {errors.basePrice && <p className="mt-1 text-xs text-red-600">{errors.basePrice}</p>}
            </div>
            <div>
              <label className={labelClass}>Discounted Price (₹)</label>
              <Input type="number" min={0} step="0.01" value={discountedPrice} onChange={(e) => setDiscountedPrice(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Weight (grams)</label>
              <Input type="number" min={0} step="0.01" value={weightGrams} onChange={(e) => setWeightGrams(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Metal Type *</label>
              <Select value={metalType} onChange={(e) => setMetalType(e.target.value as AdminMetalType)}>
                {METAL_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className={labelClass}>Stock Status</label>
              <Select value={stockStatus} onChange={(e) => setStockStatus(e.target.value as StockStatus)}>
                {STOCK_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/60">Category</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Category *</label>
              <Select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value)
                  setSubCategoryId('')
                }}
              >
                <option value="">Select a category…</option>
                {(categories ?? []).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
              {errors.categoryId && <p className="mt-1 text-xs text-red-600">{errors.categoryId}</p>}
            </div>
            <div>
              <label className={labelClass}>Sub-Category</label>
              <Select value={subCategoryId} onChange={(e) => setSubCategoryId(e.target.value)} disabled={!categoryId}>
                <option value="">None</option>
                {(subCategories ?? []).map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="mt-4 flex gap-6">
            <label className="flex items-center gap-2 text-sm text-ink/80">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-[#c9a961]" />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm text-ink/80">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 accent-[#c9a961]" />
              Featured
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/60">Images</h2>
            <Button type="button" size="sm" variant="outline" className="gap-1 rounded-md" onClick={addImageRow}>
              <Plus className="h-3.5 w-3.5" strokeWidth={2} /> Add Image
            </Button>
          </div>
          {errors.images && <p className="mb-3 text-xs text-red-600">{errors.images}</p>}
          <div className="flex flex-col gap-3">
            {images.map((row) => (
              <div key={row.key} className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-ink/60">
                  <input
                    type="radio"
                    name="primary-image"
                    checked={row.isPrimary}
                    onChange={() => setPrimaryImage(row.key)}
                    className="h-4 w-4 accent-[#c9a961]"
                  />
                  Primary
                </label>
                <Input
                  value={row.imageUrl}
                  onChange={(e) => updateImageRow(row.key, { imageUrl: e.target.value })}
                  placeholder="https://…"
                  className={`${inputClass} flex-1`}
                />
                <Input
                  value={row.altText ?? ''}
                  onChange={(e) => updateImageRow(row.key, { altText: e.target.value })}
                  placeholder="Alt text (optional)"
                  className={`${inputClass} w-48`}
                />
                <button
                  type="button"
                  onClick={() => removeImageRow(row.key)}
                  disabled={images.length === 1}
                  className="rounded-md border border-black/10 p-2 text-ink/50 transition-colors hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/60">Collections &amp; Occasions</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/50">Collections</p>
              <div className="flex flex-col gap-2">
                {(collections ?? []).map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm text-ink/80">
                    <input
                      type="checkbox"
                      checked={collectionIds.includes(c.id)}
                      onChange={() => setCollectionIds((prev) => toggleId(prev, c.id))}
                      className="h-4 w-4 accent-[#c9a961]"
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/50">Occasions</p>
              <div className="flex flex-col gap-2">
                {(occasions ?? []).map((o) => (
                  <label key={o.id} className="flex items-center gap-2 text-sm text-ink/80">
                    <input
                      type="checkbox"
                      checked={occasionIds.includes(o.id)}
                      onChange={() => setOccasionIds((prev) => toggleId(prev, o.id))}
                      className="h-4 w-4 accent-[#c9a961]"
                    />
                    {o.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/60">SEO (optional)</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Meta Title</label>
              <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Meta Description</label>
              <Input value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className={inputClass} />
            </div>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" className="rounded-md px-6" disabled={isSaving}>
            {isSaving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
          </Button>
          <Button asChild type="button" variant="outline" size="sm" className="rounded-md">
            <Link to="/admin/products">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
