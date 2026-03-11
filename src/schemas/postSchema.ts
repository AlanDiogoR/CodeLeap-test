import { z } from 'zod'

export const postSchema = z.object({
  id: z.union([z.number(), z.string()]),
  username: z.string(),
  created_datetime: z.string(),
  title: z.string(),
  content: z.string(),
  authorId: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
})

export const listResponseSchema = z.object({
  count: z.number().optional(),
  next: z.string().nullable().optional(),
  previous: z.string().nullable().optional(),
  results: z.array(postSchema),
})

export const apiPostSchema = z.object({
  id: z.number(),
  username: z.string(),
  created_datetime: z.string(),
  title: z.string(),
  content: z.string(),
})

export type PostSchema = z.infer<typeof postSchema>
export type ListResponseSchema = z.infer<typeof listResponseSchema>
