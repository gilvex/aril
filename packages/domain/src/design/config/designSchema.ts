import { z } from 'zod'
import { designPageSchema } from './designPageSchema.ts'
import { designLibrarySchema } from '../../designLibrary/config/designLibrarySchema.ts'
export const designSchema = z.object({
  library: designLibrarySchema.optional(),
  pages: z
    .array(designPageSchema)
    .max(30)
    .refine(
      (pages) => new Set(pages.map((page) => page.id)).size === pages.length,
      'Duplicate design page IDs',
    )
    .optional(),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  density: z.enum(['Comfortable', 'Compact']),
  direction: z.string().max(12000),
  headingFont: z.enum(['Manrope', 'DM Sans', 'System', 'Georgia']).optional(),
  bodyFont: z.enum(['Manrope', 'DM Sans', 'System', 'Georgia']).optional(),
})
