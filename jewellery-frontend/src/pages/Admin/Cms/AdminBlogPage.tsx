import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import {
  useAdminBlogPosts,
  useCreateAdminBlogPost,
  useDeleteAdminBlogPost,
  useUpdateAdminBlogPost,
} from '@/hooks/admin/useAdminBlog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import type { AdminBlogPost, AdminBlogPostPayload } from '@/types/admin'

const inputClass = 'h-10 rounded-md px-3'
const labelClass = 'mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/50'
const textareaClass =
  'w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus-visible:border-gold-dark focus-visible:ring-2 focus-visible:ring-gold/20'

/** Local, best-effort slug suggestion — the backend re-derives from title via `SlugUtil`
 * anyway when the slug field is left blank, so this is purely a convenience prefill. */
function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface FormState {
  title: string
  slug: string
  slugTouched: boolean
  excerpt: string
  content: string
  coverImageUrl: string
  authorName: string
  isPublished: boolean
  metaTitle: string
  metaDescription: string
}

function emptyForm(): FormState {
  return {
    title: '',
    slug: '',
    slugTouched: false,
    excerpt: '',
    content: '',
    coverImageUrl: '',
    authorName: '',
    isPublished: false,
    metaTitle: '',
    metaDescription: '',
  }
}

function toForm(entity: AdminBlogPost): FormState {
  return {
    title: entity.title,
    slug: entity.slug,
    slugTouched: true,
    excerpt: entity.excerpt ?? '',
    content: entity.content,
    coverImageUrl: entity.coverImageUrl ?? '',
    authorName: entity.authorName ?? '',
    isPublished: entity.isPublished,
    metaTitle: entity.metaTitle ?? '',
    metaDescription: entity.metaDescription ?? '',
  }
}

function toPayload(form: FormState): AdminBlogPostPayload {
  return {
    title: form.title.trim(),
    slug: form.slug.trim() || undefined,
    excerpt: form.excerpt.trim() || undefined,
    content: form.content.trim(),
    coverImageUrl: form.coverImageUrl.trim() || undefined,
    authorName: form.authorName.trim() || undefined,
    isPublished: form.isPublished,
    metaTitle: form.metaTitle.trim() || undefined,
    metaDescription: form.metaDescription.trim() || undefined,
  }
}

export default function AdminBlogPage() {
  const { data: posts, isLoading, isError } = useAdminBlogPosts()
  const createPost = useCreateAdminBlogPost()
  const updatePost = useUpdateAdminBlogPost()
  const deletePost = useDeleteAdminBlogPost()

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setFormOpen(true)
  }

  function openEdit(entity: AdminBlogPost) {
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
      toast.success(editingId ? 'Post updated.' : 'Post created.')
      setFormOpen(false)
    }
    const onError = (error: { message?: string }) => toast.error(error?.message ?? 'Could not save this post.')

    if (editingId) {
      updatePost.mutate({ id: editingId, payload }, { onSuccess, onError })
    } else {
      createPost.mutate(payload, { onSuccess, onError })
    }
  }

  function handleDelete(entity: AdminBlogPost) {
    if (!window.confirm(`Delete post "${entity.title}"? This cannot be undone.`)) return
    deletePost.mutate(entity.id, {
      onSuccess: () => toast.success('Post deleted.'),
      onError: (error) => toast.error(error?.message ?? 'Could not delete this post.'),
    })
  }

  function handleTogglePublish(entity: AdminBlogPost) {
    updatePost.mutate(
      {
        id: entity.id,
        payload: {
          title: entity.title,
          slug: entity.slug,
          excerpt: entity.excerpt ?? undefined,
          content: entity.content,
          coverImageUrl: entity.coverImageUrl ?? undefined,
          authorName: entity.authorName ?? undefined,
          isPublished: !entity.isPublished,
          metaTitle: entity.metaTitle ?? undefined,
          metaDescription: entity.metaDescription ?? undefined,
        },
      },
      {
        onSuccess: () => toast.success(entity.isPublished ? 'Post unpublished.' : 'Post published.'),
        onError: (error) => toast.error(error?.message ?? 'Could not update this post.'),
      },
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Blog</h1>
          <p className="mt-1 text-sm text-ink/50">Journal posts shown on the public storefront at /blog.</p>
        </div>
        <Button size="sm" className="gap-1.5 rounded-md" onClick={openCreate}>
          <Plus className="h-4 w-4" strokeWidth={2} />
          New Post
        </Button>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="rounded-lg border border-gold/30 bg-gold/5 p-4">
          <h3 className="mb-3 text-sm font-semibold text-ink">{editingId ? 'Edit Post' : 'New Post'}</h3>
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
            <div>
              <label className={labelClass}>Cover Image URL</label>
              <Input value={form.coverImageUrl} onChange={(e) => setForm((f) => ({ ...f, coverImageUrl: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Author Name</label>
              <Input value={form.authorName} onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Excerpt</label>
              <Input value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Content *</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={10}
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
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-ink/80">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                  className="h-4 w-4 accent-[#c9a961]"
                />
                Published
              </label>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit" size="sm" className="rounded-md" disabled={createPost.isPending || updatePost.isPending}>
              {createPost.isPending || updatePost.isPending ? 'Saving…' : 'Save'}
            </Button>
            <Button type="button" size="sm" variant="outline" className="rounded-md" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError || !posts ? (
        <p className="text-sm text-ink/60">Could not load blog posts right now.</p>
      ) : (
        <div className="rounded-lg border border-black/10 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((entity) => (
                <TableRow key={entity.id}>
                  <TableCell className="font-medium text-ink">{entity.title}</TableCell>
                  <TableCell className="font-mono text-xs">{entity.slug}</TableCell>
                  <TableCell>{entity.authorName ?? '—'}</TableCell>
                  <TableCell>{formatDate(entity.publishedDate) || '—'}</TableCell>
                  <TableCell>
                    <button onClick={() => handleTogglePublish(entity)} className="outline-none">
                      <Badge variant={entity.isPublished ? 'success' : 'muted'} size="pill">
                        {entity.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </button>
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
