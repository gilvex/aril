import type { GoogleApi } from '@/features/googleSignIn/types/googleApi.ts'
declare global {
  interface Window {
    google?: GoogleApi
  }
}
