import { z } from 'zod'
import { presenceSchema } from '../../collaboration/index.ts'

export type LiveState = z.infer<typeof presenceSchema>
