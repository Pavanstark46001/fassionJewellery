import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  useAddAdminHomeSectionItem,
  useAdminHomeSections,
  useCreateAdminHomeSection,
  useDeleteAdminHomeSection,
  useDeleteAdminHomeSectionItem,
  useReorderAdminHomeSection,
  useUpdateAdminHomeSection,
} from '@/hooks/admin/useAdminCms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type {
  AdminHomeSection,
  AdminHomeSectionItemPayload,
  AdminHomeSectionPayload,
  AdminReferenceType,
  AdminSectionType,
} from '@/types/admin'

const inputClass = 'h-10 rounded-md px-3'
const labelClass = 'mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/50'

const SECTION_TYPES: AdminSectionType[] = ['CATEGORY_GRID', 'COLLECTION_SHOWCASE', 'PRODUCT_CAROUSEL', 'OCCASION_LIST']
const REFERENCE_TYPES: AdminReferenceType[] = ['CATEGORY', 'SUBCATEGORY', 'COLLECTION', 'OCCASION', 'PRODUCT']

interface FormState {
  title: string
  subtitle: string
  sectionType: AdminSectionType
  displayOrder: string
  isActive: boolean
}

function emptyForm(): FormState {
  return { title: '', subtitle: '', sectionType: 'CATEGORY_GRID', displayOrder: '', isActive: true }
}

function toForm(entity: AdminHomeSection): FormState {
  return {
    title: entity.title,
    subtitle: entity.subtitle ?? '',
    sectionType: entity.sectionType,
    displayOrder: entity.displayOrder != null ? String(entity.displayOrder) : '',
    isActive: entity.isActive,
  }
}

function toPayload(form: FormState): AdminHomeSectionPayload {
  return {
    title: form.title.trim(),
    subtitle: form.subtitle.trim() || undefined,
    sectionType: form.sectionType,
    displayOrder: form.displayOrder ? Number(form.displayOrder) : undefined,
    isActive: form.isActive,
  }
}

interface ItemFormState {
  referenceType: AdminReferenceType
  referenceId: string
  displayOrder: string
  overrideImageUrl: string
}

function emptyItemForm(): ItemFormState {
  return { referenceType: 'PRODUCT', referenceId: '', displayOrder: '', overrideImageUrl: '' }
}

export default function AdminHomeSectionsPage() {
  const { data: sections, isLoading, isError } = useAdminHomeSections()
  const createSection = useCreateAdminHomeSection()
  const updateSection = useUpdateAdminHomeSection()
  const deleteSection = useDeleteAdminHomeSection()
  const reorderSection = useReorderAdminHomeSection()
  const addItem = useAddAdminHomeSectionItem()
  const deleteItem = useDeleteAdminHomeSectionItem()

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [itemForm, setItemForm] = useState<ItemFormState>(emptyItemForm())

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setFormOpen(true)
  }

  function openEdit(entity: AdminHomeSection) {
    setEditingId(entity.id)
    setForm(toForm(entity))
    setFormOpen(true)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const payload = toPayload(form)
    const onSuccess = () => {
      toast.success(editingId ? 'Section updated.' : 'Section created.')
      setFormOpen(false)
    }
    const onError = (error: { message?: string }) => toast.error(error?.message ?? 'Could not save this section.')

    if (editingId) {
      updateSection.mutate({ id: editingId, payload }, { onSuccess, onError })
    } else {
      createSection.mutate(payload, { onSuccess, onError })
    }
  }

  function handleDelete(entity: AdminHomeSection) {
    if (!window.confirm(`Delete section "${entity.title}"? This also removes its items.`)) return
    deleteSection.mutate(entity.id, {
      onSuccess: () => toast.success('Section deleted.'),
      onError: (error) => toast.error(error?.message ?? 'Could not delete this section.'),
    })
  }

  const sorted = [...(sections ?? [])].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))

  function move(index: number, direction: -1 | 1) {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= sorted.length) return
    const current = sorted[index]
    const target = sorted[targetIndex]
    const currentOrder = current.displayOrder ?? index
    const targetOrder = target.displayOrder ?? targetIndex

    reorderSection.mutate(
      { id: current.id, payload: { displayOrder: targetOrder } },
      {
        onError: () => toast.error('Could not reorder sections.'),
      },
    )
    reorderSection.mutate(
      { id: target.id, payload: { displayOrder: currentOrder } },
      {
        onError: () => toast.error('Could not reorder sections.'),
      },
    )
  }

  function handleAddItem(sectionId: string, e: FormEvent) {
    e.preventDefault()
    if (!itemForm.referenceId.trim()) {
      toast.error('Reference ID is required.')
      return
    }
    const payload: AdminHomeSectionItemPayload = {
      referenceType: itemForm.referenceType,
      referenceId: itemForm.referenceId.trim(),
      displayOrder: itemForm.displayOrder ? Number(itemForm.displayOrder) : undefined,
      overrideImageUrl: itemForm.overrideImageUrl.trim() || undefined,
    }
    addItem.mutate(
      { sectionId, payload },
      {
        onSuccess: () => {
          toast.success('Item added.')
          setItemForm(emptyItemForm())
        },
        onError: (error) => toast.error(error?.message ?? 'Could not add item.'),
      },
    )
  }

  function handleDeleteItem(sectionId: string, itemId: string) {
    if (!window.confirm('Remove this item from the section?')) return
    deleteItem.mutate(
      { sectionId, itemId },
      {
        onSuccess: () => toast.success('Item removed.'),
        onError: (error) => toast.error(error?.message ?? 'Could not remove item.'),
      },
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Homepage Sections</h1>
          <p className="mt-1 text-sm text-ink/50">
            Homepage content blocks (category grids, collection showcases, carousels) and the items within them.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 rounded-md" onClick={openCreate}>
          <Plus className="h-4 w-4" strokeWidth={2} />
          New Section
        </Button>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="rounded-lg border border-gold/30 bg-gold/5 p-4">
          <h3 className="mb-3 text-sm font-semibold text-ink">{editingId ? 'Edit Section' : 'New Section'}</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={labelClass}>Title *</label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <Input value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Section Type *</label>
              <Select value={form.sectionType} onChange={(e) => setForm((f) => ({ ...f, sectionType: e.target.value as AdminSectionType }))}>
                {SECTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className={labelClass}>Display Order</label>
              <Input type="number" value={form.displayOrder} onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))} className={inputClass} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-ink/80">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="h-4 w-4 accent-[#c9a961]" />
                Active
              </label>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit" size="sm" className="rounded-md" disabled={createSection.isPending || updateSection.isPending}>
              {createSection.isPending || updateSection.isPending ? 'Saving…' : 'Save'}
            </Button>
            <Button type="button" size="sm" variant="outline" className="rounded-md" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError || !sections ? (
        <p className="text-sm text-ink/60">Could not load homepage sections right now.</p>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-ink/60">No sections yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((section, index) => {
            const expanded = expandedId === section.id
            return (
              <div key={section.id} className="rounded-lg border border-black/10 bg-white">
                <div className="flex items-center justify-between gap-4 p-4">
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : section.id)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    {expanded ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-ink/50" strokeWidth={1.75} />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-ink/50" strokeWidth={1.75} />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ink">{section.title}</span>
                        <Badge variant="outline" size="pill">
                          {section.sectionType}
                        </Badge>
                        <Badge variant={section.isActive ? 'success' : 'muted'} size="pill">
                          {section.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="mt-1 text-xs text-ink/50">
                        Order {section.displayOrder ?? '—'} · {section.items.length} item{section.items.length === 1 ? '' : 's'}
                      </div>
                    </div>
                  </button>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      className="rounded-md border border-black/10 p-1.5 text-ink/60 hover:border-gold-dark hover:text-gold-dark disabled:pointer-events-none disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ChevronUp className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                    <button
                      onClick={() => move(index, 1)}
                      disabled={index === sorted.length - 1}
                      className="rounded-md border border-black/10 p-1.5 text-ink/60 hover:border-gold-dark hover:text-gold-dark disabled:pointer-events-none disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                    <button onClick={() => openEdit(section)} className="rounded-md border border-black/10 p-1.5 text-ink/60 hover:border-gold-dark hover:text-gold-dark">
                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                    <button onClick={() => handleDelete(section)} className="rounded-md border border-black/10 p-1.5 text-ink/60 hover:border-red-300 hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div className="border-t border-black/5 bg-[#fafafa] p-4">
                    {section.items.length > 0 && (
                      <ul className="mb-4 flex flex-col gap-2">
                        {[...section.items]
                          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
                          .map((item) => (
                            <li
                              key={item.id}
                              className="flex items-center justify-between gap-3 rounded-md border border-black/10 bg-white px-3 py-2 text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <Badge variant="muted" size="pill">
                                  {item.referenceType}
                                </Badge>
                                <span className="font-mono text-xs text-ink/70">{item.referenceId}</span>
                                <span className="text-xs text-ink/40">order {item.displayOrder ?? '—'}</span>
                              </div>
                              <button
                                onClick={() => handleDeleteItem(section.id, item.id)}
                                className="rounded-md border border-black/10 p-1 text-ink/50 hover:border-red-300 hover:text-red-600"
                              >
                                <Trash2 className="h-3 w-3" strokeWidth={1.75} />
                              </button>
                            </li>
                          ))}
                      </ul>
                    )}

                    <form onSubmit={(e) => handleAddItem(section.id, e)} className="grid grid-cols-2 gap-2 md:grid-cols-4">
                      <Select
                        value={itemForm.referenceType}
                        onChange={(e) => setItemForm((f) => ({ ...f, referenceType: e.target.value as AdminReferenceType }))}
                      >
                        {REFERENCE_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </Select>
                      <Input
                        placeholder="Reference ID (UUID)"
                        value={itemForm.referenceId}
                        onChange={(e) => setItemForm((f) => ({ ...f, referenceId: e.target.value }))}
                        className={inputClass}
                      />
                      <Input
                        type="number"
                        placeholder="Order"
                        value={itemForm.displayOrder}
                        onChange={(e) => setItemForm((f) => ({ ...f, displayOrder: e.target.value }))}
                        className={inputClass}
                      />
                      <Button type="submit" size="sm" className="rounded-md" disabled={addItem.isPending}>
                        {addItem.isPending ? 'Adding…' : 'Add Item'}
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
