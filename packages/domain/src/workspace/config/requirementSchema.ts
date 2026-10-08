import { z } from 'zod'

export const requirementSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().min(1).max(160),
  description: z.string().max(5000),
  category: z.enum(['Deployment', 'Access', 'Operations', 'Experience']),
  priority: z.enum(['Must have', 'Should have', 'Later']),
  status: z.enum(['Captured', 'Designing', 'Ready']),
  acceptance: z.string().max(5000),
  decision: z.enum(['Proposed', 'Agreed', 'Deferred']).optional(),
  workspaceWide: z.boolean().optional(),
  questions: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        text: z.string().max(2000),
        resolved: z.boolean(),
      }),
    )
    .max(50)
    .refine(
      (items) => new Set(items.map((item) => item.id)).size === items.length,
    )
    .optional(),
  links: z
    .array(
      z
        .object({
          kind: z.enum(['canvas', 'wireframes', 'design']),
          boardId: z.string().min(1).max(100).optional(),
          pageId: z.string().min(1).max(100).optional(),
        })
        .refine((link) =>
          link.kind === 'design'
            ? !!link.pageId
            : !!link.boardId && !link.pageId,
        ),
    )
    .max(100)
    .refine(
      (links) =>
        new Set(
          links.map((link) =>
            JSON.stringify([link.kind, link.boardId || '', link.pageId || '']),
          ),
        ).size === links.length,
    )
    .optional(),
})
