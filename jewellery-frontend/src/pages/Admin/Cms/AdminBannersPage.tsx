import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import {
  useAdminBanners,
  useCreateAdminBanner,
  useDeleteAdminBanner,
  useUpdateAdminBanner,
} from '@/hooks/admin/useAdminCms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { AdminBanner, AdminBannerPayload } from '@/types/admin'

const inputClass = 'h-10 rounded-md px-3'
const labelClass = 'mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/50'

interface FormState {
  title: string
  subtitle: string
  imageUrl: string
  linkUrl: string
  displayOrder: string
  isActive: boolean
}

function emptyForm(): FormState {
  return { title: '', subtitle: '', imageUrl: '', linkUrl: '', displayOrder: '', isActive: true }
}

function toForm(entity: AdminBanner): FormState {
  return {
    title: entity.title,
    subtitle: entity.subtitle ?? '',
    imageUrl: entity.imageUrl,
    linkUrl: entity.linkUrl ?? '',
    displayOrder: entity.displayOrder != null ? String(entity.displayOrder) : '',
    isActive: entity.isActive,
  }
}

function toPayload(form: FormState): AdminBannerPayload {
  return {
    title: form.title.trim(),
    subtitle: form.subtitle.trim() || undefined,
    imageUrl: form.imageUrl.trim(),
    linkUrl: form.linkUrl.trim() || undefined,
    displayOrder: form.displayOrder ? Number(form.displayOrder) : undefined,
    isActive: form.isActive,
  }
}

export default function AdminBannersPage() {
  const { data: banners, isLoading, isError } = useAdminBanners()
  const createBanner = useCreateAdminBanner()
  const updateBanner = useUpdateAdminBanner()
  const deleteBanner = useDeleteAdminBanner()

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setFormOpen(true)
  }

  function openEdit(entity: AdminBanner) {
    setEditingId(entity.id)
    setForm(toForm(entity))
    setFormOpen(true)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const payload = toPayload(form)
    const onSuccess = () => {
      toast.success(editingId ? 'Banner updated.' : 'Banner created.')
      setFormOpen(false)
    }
    const onError = (error: { message?: string }) => toast.error(error?.message ?? 'Could not save this banner.')

    if (editingId) {
      updateBanner.mutate({ id: editingId, payload }, { onSuccess, onError })
    } else {
      createBanner.mutate(payload, { onSuccess, onError })
    }
  }

  function handleDelete(entity: AdminBanner) {
    if (!window.confirm(`Delete banner "${entity.title}"? This cannot be undone.`)) return
    deleteBanner.mutate(entity.id, {
      onSuccess: () => toast.success('Banner deleted.'),
      onError: (error) => toast.error(error?.message ?? 'Could not delete this banner.'),
    })
  }

  const sortedBanners = [...(banners ?? [])].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Homepage Banners</h1>
          <p className="mt-1 text-sm text-ink/50">Hero/promo banners shown at the top of the storefront homepage.</p>
        </div>
        <Button size="sm" className="gap-1.5 rounded-md" onClick={openCreate}>
          <Plus className="h-4 w-4" strokeWidth={2} />
          New Banner
        </Button>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="rounded-lg border border-gold/30 bg-gold/5 p-4">
          <h3 className="mb-3 text-sm font-semibold text-ink">{editingId ? 'Edit Banner' : 'New Banner'}</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={labelClass}>Title *</label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <Input value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Display Order</label>
              <Input type="number" value={form.displayOrder} onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Image URL *</label>
              <Input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Link URL</label>
              <Input value={form.linkUrl} onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))} placeholder="/collections/necklaces" className={inputClass} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-ink/80">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="h-4 w-4 accent-[#c9a961]" />
                Active
              </label>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit" size="sm" className="rounded-md" disabled={createBanner.isPending || updateBanner.isPending}>
              {createBanner.isPending || updateBanner.isPending ? 'Saving…' : 'Save'}
            </Button>
            <Button type="button" size="sm" variant="outline" className="rounded-md" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError || !banners ? (
        <p className="text-sm text-ink/60">Could not load banners right now.</p>
      ) : (
        <div className="rounded-lg border border-black/10 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedBanners.map((entity) => (
                <TableRow key={entity.id}>
                  <TableCell>
                    <img
                      src={entity.imageUrl}
                      alt={entity.title}
                      className="h-10 w-16 rounded object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-ink">
                    {entity.title}
                    {entity.subtitle && <div className="text-xs font-normal text-ink/50">{entity.subtitle}</div>}
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate font-mono text-xs">{entity.linkUrl ?? '—'}</TableCell>
                  <TableCell>{entity.displayOrder ?? '—'}</TableCell>
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
