import { Fragment, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  useAdminCategories,
  useAdminSubCategories,
  useCreateAdminCategory,
  useCreateAdminSubCategory,
  useDeleteAdminCategory,
  useDeleteAdminSubCategory,
  useUpdateAdminCategory,
  useUpdateAdminSubCategory,
} from '@/hooks/admin/useAdminCategories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { AdminCategory, AdminCategoryPayload, AdminSubCategory } from '@/types/admin'

const inputClass = 'h-10 rounded-md px-3'
const labelClass = 'mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/50'

interface EntityFormState {
  name: string
  slug: string
  description: string
  imageUrl: string
  displayOrder: string
  isActive: boolean
}

function emptyForm(): EntityFormState {
  return { name: '', slug: '', description: '', imageUrl: '', displayOrder: '', isActive: true }
}

function toForm(entity: AdminCategory | AdminSubCategory): EntityFormState {
  return {
    name: entity.name,
    slug: entity.slug,
    description: entity.description ?? '',
    imageUrl: entity.imageUrl ?? '',
    displayOrder: entity.displayOrder != null ? String(entity.displayOrder) : '',
    isActive: entity.isActive,
  }
}

function toPayload(form: EntityFormState): AdminCategoryPayload {
  return {
    name: form.name.trim(),
    slug: form.slug.trim() || undefined,
    description: form.description.trim() || undefined,
    imageUrl: form.imageUrl.trim() || undefined,
    displayOrder: form.displayOrder ? Number(form.displayOrder) : undefined,
    isActive: form.isActive,
  }
}

function EntityFormPanel({
  title,
  form,
  onChange,
  onSubmit,
  onCancel,
  isSaving,
}: {
  title: string
  form: EntityFormState
  onChange: (patch: Partial<EntityFormState>) => void
  onSubmit: (e: FormEvent) => void
  onCancel: () => void
  isSaving: boolean
}) {
  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-gold/30 bg-gold/5 p-4">
      <h3 className="mb-3 text-sm font-semibold text-ink">{title}</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className={labelClass}>Name *</label>
          <Input value={form.name} onChange={(e) => onChange({ name: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Slug</label>
          <Input value={form.slug} onChange={(e) => onChange({ slug: e.target.value })} placeholder="auto from name" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Display Order</label>
          <Input type="number" value={form.displayOrder} onChange={(e) => onChange({ displayOrder: e.target.value })} className={inputClass} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Image URL</label>
          <Input value={form.imageUrl} onChange={(e) => onChange({ imageUrl: e.target.value })} className={inputClass} />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-ink/80">
            <input type="checkbox" checked={form.isActive} onChange={(e) => onChange({ isActive: e.target.checked })} className="h-4 w-4 accent-[#c9a961]" />
            Active
          </label>
        </div>
        <div className="md:col-span-3">
          <label className={labelClass}>Description</label>
          <Input value={form.description} onChange={(e) => onChange({ description: e.target.value })} className={inputClass} />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button type="submit" size="sm" className="rounded-md" disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" size="sm" variant="outline" className="rounded-md" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function SubCategoryPanel({ category }: { category: AdminCategory }) {
  const { data: subCategories, isLoading } = useAdminSubCategories(category.id)
  const createSub = useCreateAdminSubCategory()
  const updateSub = useUpdateAdminSubCategory()
  const deleteSub = useDeleteAdminSubCategory()

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<EntityFormState>(emptyForm())

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setFormOpen(true)
  }

  function openEdit(sub: AdminSubCategory) {
    setEditingId(sub.id)
    setForm(toForm(sub))
    setFormOpen(true)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const payload = toPayload(form)
    const onSuccess = () => {
      toast.success(editingId ? 'Sub-category updated.' : 'Sub-category created.')
      setFormOpen(false)
    }
    const onError = (error: { message?: string }) => toast.error(error?.message ?? 'Could not save this sub-category.')

    if (editingId) {
      updateSub.mutate({ categoryId: category.id, id: editingId, payload }, { onSuccess, onError })
    } else {
      createSub.mutate({ categoryId: category.id, payload }, { onSuccess, onError })
    }
  }

  function handleDelete(sub: AdminSubCategory) {
    if (!window.confirm(`Delete sub-category "${sub.name}"?`)) return
    deleteSub.mutate(
      { categoryId: category.id, id: sub.id },
      {
        onSuccess: () => toast.success('Sub-category deleted.'),
        onError: (error) => toast.error(error?.message ?? 'Could not delete this sub-category.'),
      },
    )
  }

  return (
    <div className="flex flex-col gap-3 bg-black/[0.02] p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-ink/50">Sub-Categories</h4>
        <Button type="button" size="sm" variant="outline" className="gap-1 rounded-md" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5" strokeWidth={2} /> Add Sub-Category
        </Button>
      </div>

      {formOpen && (
        <EntityFormPanel
          title={editingId ? 'Edit Sub-Category' : 'New Sub-Category'}
          form={form}
          onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          isSaving={createSub.isPending || updateSub.isPending}
        />
      )}

      {isLoading ? (
        <Skeleton className="h-20 w-full" />
      ) : !subCategories || subCategories.length === 0 ? (
        <p className="text-sm text-ink/50">No sub-categories yet.</p>
      ) : (
        <div className="overflow-hidden rounded-md border border-black/10 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subCategories.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium text-ink">{sub.name}</TableCell>
                  <TableCell className="font-mono text-xs">{sub.slug}</TableCell>
                  <TableCell>
                    <Badge variant={sub.isActive ? 'success' : 'muted'} size="pill">
                      {sub.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(sub)} className="rounded-md border border-black/10 p-1.5 text-ink/60 hover:border-gold-dark hover:text-gold-dark">
                        <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </button>
                      <button onClick={() => handleDelete(sub)} className="rounded-md border border-black/10 p-1.5 text-ink/60 hover:border-red-300 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export default function AdminCategoriesPage() {
  const { data: categories, isLoading, isError } = useAdminCategories()
  const createCategory = useCreateAdminCategory()
  const updateCategory = useUpdateAdminCategory()
  const deleteCategory = useDeleteAdminCategory()

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<EntityFormState>(emptyForm())
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setFormOpen(true)
  }

  function openEdit(category: AdminCategory) {
    setEditingId(category.id)
    setForm(toForm(category))
    setFormOpen(true)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const payload = toPayload(form)
    const onSuccess = () => {
      toast.success(editingId ? 'Category updated.' : 'Category created.')
      setFormOpen(false)
    }
    const onError = (error: { message?: string }) => toast.error(error?.message ?? 'Could not save this category.')

    if (editingId) {
      updateCategory.mutate({ id: editingId, payload }, { onSuccess, onError })
    } else {
      createCategory.mutate(payload, { onSuccess, onError })
    }
  }

  function handleDelete(category: AdminCategory) {
    if (!window.confirm(`Delete category "${category.name}"? This cannot be undone.`)) return
    deleteCategory.mutate(category.id, {
      onSuccess: () => toast.success('Category deleted.'),
      onError: (error) => toast.error(error?.message ?? 'Could not delete this category.'),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Categories</h1>
          <p className="mt-1 text-sm text-ink/50">Organize the catalog into categories and sub-categories.</p>
        </div>
        <Button size="sm" className="gap-1.5 rounded-md" onClick={openCreate}>
          <Plus className="h-4 w-4" strokeWidth={2} />
          New Category
        </Button>
      </div>

      {formOpen && (
        <EntityFormPanel
          title={editingId ? 'Edit Category' : 'New Category'}
          form={form}
          onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          isSaving={createCategory.isPending || updateCategory.isPending}
        />
      )}

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError || !categories ? (
        <p className="text-sm text-ink/60">Could not load categories right now.</p>
      ) : (
        <div className="rounded-lg border border-black/10 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead />
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <Fragment key={category.id}>
                  <TableRow>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => setExpandedId(expandedId === category.id ? null : category.id)}
                        className="rounded p-1 text-ink/50 hover:text-ink"
                      >
                        {expandedId === category.id ? (
                          <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
                        ) : (
                          <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="font-medium text-ink">{category.name}</TableCell>
                    <TableCell className="font-mono text-xs">{category.slug}</TableCell>
                    <TableCell>{category.displayOrder ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={category.isActive ? 'success' : 'muted'} size="pill">
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(category)} className="rounded-md border border-black/10 p-1.5 text-ink/60 hover:border-gold-dark hover:text-gold-dark">
                          <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </button>
                        <button onClick={() => handleDelete(category)} className="rounded-md border border-black/10 p-1.5 text-ink/60 hover:border-red-300 hover:text-red-600">
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedId === category.id && (
                    <TableRow>
                      <TableCell colSpan={6} className="p-0">
                        <SubCategoryPanel category={category} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
