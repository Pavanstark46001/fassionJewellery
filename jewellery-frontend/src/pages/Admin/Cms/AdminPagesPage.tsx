import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import {
  useAdminPages,
  useCreateAdminPage,
  useDeleteAdminPage,
  useUpdateAdminPage,
} from '@/hooks/admin/useAdminPages'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { AdminStaticPage, AdminStaticPagePayload } from '@/types/admin'

const inputClass = 'h-10 rounded-md px-3'
const labelClass = 'mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/50'
const textareaClass =
  'w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus-visible:border-gold-dark focus-visible:ring-2 focus-visible:ring-gold/20'

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface FormState {
  slug: string
  slugTouched: boolean
  title: string
  content: string
  metaTitle: string
  metaDescription: string
}

function emptyForm(): FormState {
  return { slug: '', slugTouched: false, title: '', content: '', metaTitle: '', metaDescription: '' }
}

function toForm(entity: AdminStaticPage): FormState {
  return {
    slug: entity.slug,
    slugTouched: true,
    title: entity.title,
    content: entity.content,
    metaTitle: entity.metaTitle ?? '',
    metaDescription: entity.metaDescription ?? '',
  }
}

function toPayload(form: FormState): AdminStaticPagePayload {
  return {
    slug: form.slug.trim() || undefined,
    title: form.title.trim(),
    content: form.content.trim(),
    metaTitle: form.metaTitle.trim() || undefined,
    metaDescription: form.metaDescription.trim() || undefined,
  }
}

export default function AdminPagesPage() {
  const { data: pages, isLoading, isError } = useAdminPages()
  const createPage = useCreateAdminPage()
  const updatePage = useUpdateAdminPage()
  const deletePage = useDeleteAdminPage()

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setFormOpen(true)
  }

  function openEdit(entity: AdminStaticPage) {
    setEditingId(entity.id)
    setForm(toForm(entity))
    setFormOpen(true)
  }

  function handleTitleChange(value: string) {
    setForm((f) => ({
      ...f,
      title: value,
      slug: f.slugTouched ? f.slug : slugify(value),
    }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const payload = toPayload(form)
    const onSuccess = () => {
      toast.success(editingId ? 'Page updated.' : 'Page created.')
      setFormOpen(false)
    }
    const onError = (error: { message?: string }) => toast.error(error?.message ?? 'Could not save this page.')

    if (editingId) {
      updatePage.mutate({ id: editingId, payload }, { onSuccess, onError })
    } else {
      createPage.mutate(payload, { onSuccess, onError })
    }
  }

  function handleDelete(entity: AdminStaticPage) {
    if (!window.confirm(`Delete page "${entity.title}"? This cannot be undone.`)) return
    deletePage.mutate(entity.id, {
      onSuccess: () => toast.success('Page deleted.'),
      onError: (error) => toast.error(error?.message ?? 'Could not delete this page.'),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Static Pages</h1>
          <p className="mt-1 text-sm text-ink/50">Legal/policy pages shown on the public storefront at /pages/:slug.</p>
        </div>
        <Button size="sm" className="gap-1.5 rounded-md" onClick={openCreate}>
          <Plus className="h-4 w-4" strokeWidth={2} />
          New Page
        </Button>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="rounded-lg border border-gold/30 bg-gold/5 p-4">
          <h3 className="mb-3 text-sm font-semibold text-ink">{editingId ? 'Edit Page' : 'New Page'}</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className={labelClass}>Title *</label>
              <Input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Slug</label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value, slugTouched: true }))}
                placeholder="auto from title"
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Content *</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={12}
                className={textareaClass}
              />
            </div>
            <div>
              <label className={labelClass}>Meta Title</label>
              <Input value={form.metaTitle} onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Meta Description</label>
              <Input value={form.metaDescription} onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit" size="sm" className="rounded-md" disabled={createPage.isPending || updatePage.isPending}>
              {createPage.isPending || updatePage.isPending ? 'Saving…' : 'Save'}
            </Button>
            <Button type="button" size="sm" variant="outline" className="rounded-md" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError || !pages ? (
        <p className="text-sm text-ink/60">Could not load pages right now.</p>
      ) : (
        <div className="rounded-lg border border-black/10 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((entity) => (
                <TableRow key={entity.id}>
                  <TableCell className="font-medium text-ink">{entity.title}</TableCell>
                  <TableCell className="font-mono text-xs">{entity.slug}</TableCell>
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
