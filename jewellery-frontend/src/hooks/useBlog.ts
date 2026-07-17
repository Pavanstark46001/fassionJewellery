import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { BlogPostDetail, BlogPostSummary, PaginatedResponse } from '@/types/api'

export interface BlogListParams {
  page?: number
  size?: number
}

async function fetchBlogList(params: BlogListParams): Promise<PaginatedResponse<BlogPostSummary>> {
  const { data } = await api.get<PaginatedResponse<BlogPostSummary>>('/blog', { params })
  return data
}

/** Public, published-only blog listing — `GET /blog`. */
export function useBlogList(params: BlogListParams) {
  return useQuery({
    queryKey: ['blog', 'list', params],
    queryFn: () => fetchBlogList(params),
    placeholderData: keepPreviousData,
  })
}

async function fetchBlogPost(slug: string): Promise<BlogPostDetail> {
  const { data } = await api.get<BlogPostDetail>(`/blog/${slug}`)
  return data
}

/** Public blog post detail — `GET /blog/{slug}` (404s for drafts/unknown slugs). */
export function useBlogPost(slug: string | undefined) {
  return useQuery({
    queryKey: ['blog', 'post', slug],
    queryFn: () => fetchBlogPost(slug as string),
    enabled: Boolean(slug),
    retry: false,
  })
}
