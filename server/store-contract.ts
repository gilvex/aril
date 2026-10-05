import type { openStore } from './store.ts'
import type { Profile } from '../domain/collaboration.ts'
type MaybeAsync<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => R | Promise<R>
    : T[K]
}
type LocalStore = ReturnType<typeof openStore>
export type Store = MaybeAsync<Omit<LocalStore, 'identity'>> & {
  createTransfer?: (id: string) => Promise<string>
  redeemTransfer?: (
    token: string,
  ) => Promise<{ profile: Profile; token: string } | null>
  identity: MaybeAsync<LocalStore['identity']>
  cloud?: {
    revision: (workspaceId: string) => Promise<number>
  }
}
