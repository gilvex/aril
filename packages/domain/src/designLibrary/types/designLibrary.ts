import type { z } from 'zod'
import type { designLibrarySchema } from '../config/designLibrarySchema.ts'
export type DesignLibrary = z.infer<typeof designLibrarySchema>
