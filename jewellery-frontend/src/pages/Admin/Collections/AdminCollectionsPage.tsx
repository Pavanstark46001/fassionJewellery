import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import {
  useAdminCollections,
  useCreateAdminCollection,
  useDeleteAdminCollection,
  useUpdateAdminCollection,
} from '@/hooks/admin/useAdminCollections'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { AdminCollection, AdminCollectionPayload } from '@/types/admin'

const inputClass = 'h-10 rounded-md px-3'
const labelClass = 'mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/50'

interface FormState {
  name: string
  slug: string
  description: string
  imageUrl: string
  displayOrder: string
  isFeatured: boolean
  isActive: boolean
}

function emptyForm(): FormState {
  return { name: '', slug: '', description: '', imageUrl: '', displayOrder: '', isFeatured: false, isActive: true }
}

function toForm(entity: AdminCollection): FormState {
  return {
    name: entity.name,
    slug: entity.slug,
    description: entity.description ?? '',
    imageUrl: entity.imageUrl ?? '',
    displayOrder: entity.displayOrder != null ? String(entity.displayOrder) : '',
    isFeatured: entity.isFeatured,
    isActive: entity.isActive,
  }
}

function toPayload(form: FormState): AdminCollectionPayload {
  return {
    name: form.name.trim(),
    slug: form.slug.trim() || undefined,
    description: form.description.trim() || undefined,
    imageUrl: form.imageUrl.trim() || undefined,
    displayOrder: form.displayOrder ? Number(form.displayOrder) : undefined,
    isFeatured: form.isFeatured,
    isActive: form.isActive,
  }
}

export default function AdminCollectionsPage() {
  const { data: collections, isLoading, isError } = useAdminCollections()
  const createCollection = useCreateAdminCollection()
  const updateCollection = useUpdateAdminCollection()
  const deleteCollection = useDeleteAdminCollection()

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setFormOpen(true)
  }

  function openEdit(entity: AdminCollection) {
    setEditingId(entity.id)
    setForm(toForm(entity))
    setFormOpen(true)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const payload = toPayload(form)
    const onSuccess = () => {
      toast.success(editingId ? 'Collection updated.' : 'Collection created.')
      setFormOpen(false)
    }
    const onError = (error: { message?: string }) => toast.error(error?.message ?? 'Could not save this collection.')

    if (editingId) {
      updateCollection.mutate({ id: editingId, payload }, { onSuccess, onError })
    } else {
      createCollection.mutate(payload, { onSuccess, onError })
    }
  }

  function handleDelete(entity: AdminCollection) {
    if (!window.confirm(`Delete collection "${entity.name}"? This cannot be undone.`)) return
    deleteCollection.mutate(entity.id, {
      onSuccess: () => toast.success('Collection deleted.'),
      onError: (error) => toast.error(error?.message ?? 'Could not delete this collection.'),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Collections</h1>
          <p className="mt-1 text-sm text-ink/50">Curated groupings shown on the storefront.</p>
        </div>
        <Button size="sm" className="gap-1.5 rounded-md" onClick={openCreate}>
          <Plus className="h-4 w-4" strokeWidth={2} />
          New Collection
        </Button>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="rounded-lg border border-gold/30 bg-gold/5 p-4">
          <h3 className="mb-3 text-sm font-semibold text-ink">{editingId ? 'Edit Collection' : 'New Collection'}</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={labelClass}>Name *</label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Slug</label>
              <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="auto from name" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Display Order</label>
              <Input type="number" value={form.displayOrder} onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Image URL</label>
              <Input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} className={inputClass} />
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 text-sm text-ink/80">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} className="h-4 w-4 accent-[#c9a961]" />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm text-ink/80">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="h-4 w-4 accent-[#c9a961]" />
                Active
              </label>
            </div>
            <div className="md:col-span-3">
              <label className={labelClass}>Description</label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit" size="sm" className="rounded-md" disabled={createCollection.isPending || updateCollection.isPending}>
              {createCollection.isPending || updateCollection.isPending ? 'Saving…' : 'Save'}
            </Button>
            <Button type="button" size="sm" variant="outline" className="rounded-md" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError || !collections ? (
        <p className="text-sm text-ink/60">Could not load collections right now.</p>
      ) : (
        <div className="rounded-lg border border-black/10 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections.map((entity) => (
                <TableRow key={entity.id}>
                  <TableCell className="font-medium text-ink">{entity.name}</TableCell>
                  <TableCell className="font-mono text-xs">{entity.slug}</TableCell>
                  <TableCell>
                    <Badge variant={entity.isFeatured ? 'gold' : 'muted'} size="pill">
                      {entity.isFeatured ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={entity.isActive ? 'success' : 'muted'} size="pill">
                      {entity.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(entity)} className="rounded-md border border-black/10 p-1.5 text-ink/60 hover:border-gold-dark hover:text-gold-dark">
                        <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </button>
                      <button onClick={() => handleDelete(entity)} className="rounded-md border border-black/10 p-1.5 text-ink/60 hover:border-red-300 hover:text-red-600">
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
