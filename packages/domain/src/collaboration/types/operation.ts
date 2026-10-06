import type { Json } from './json.ts'
export type Operation = { path: string[]; before?: Json; after?: Json }
