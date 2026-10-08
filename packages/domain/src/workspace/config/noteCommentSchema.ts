import { z } from 'zod'

export const noteCommentSchema = z.object({
  id: z.string().uuid(),
  noteId: z.string().min(1).max(90),
  authorId: z.string().uuid(),
  authorName: z.string().min(1).max(100),
  body: z.string().trim().min(1).max(2000),
  quote: z.string().max(2000),
  createdAt: z.number().int().nonnegative().max(8640000000000000),
  resolved: z.boolean(),
})
