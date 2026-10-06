import type { Json } from '../types/json.ts'
export const object = (v: Json | undefined): v is Record<string, Json> =>
  v !== null && typeof v === 'object' && !Array.isArray(v)
