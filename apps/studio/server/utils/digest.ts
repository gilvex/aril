import { createHash } from 'node:crypto'
export const digest = (token: string) =>
  createHash('sha256').update(token).digest('hex')
