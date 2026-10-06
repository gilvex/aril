import { z } from 'zod'
import { workspaceSchema } from '../config/workspaceSchema.ts'
export type Workspace = z.infer<typeof workspaceSchema>
