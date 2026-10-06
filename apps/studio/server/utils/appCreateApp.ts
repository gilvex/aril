import { createApplication } from '../app.ts'
import { openStore } from '../store.ts'
export function createApp(database: string, publicOrigin?: string) {
  return createApplication(openStore(database), publicOrigin)
}
