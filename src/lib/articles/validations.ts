import { z } from 'zod'

export const articleFormSchema = z.object({
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().max(220).optional(),
  excerpt: z.string().trim().max(500).optional(),
  categoryId: z.string().min(1, 'Choose a category.'),
  authorId: z.string().min(1, 'Choose an author.'),
  tagIds: z.array(z.string()).default([]),
  featuredImageId: z.string().optional(),
  seoTitle: z.string().trim().max(70).optional(),
  seoDescription: z.string().trim().max(200).optional(),
  publishMode: z.enum(['draft', 'now', 'schedule']),
  scheduledFor: z.string().optional(),
})

export type ArticleFormInput = z.infer<typeof articleFormSchema>
