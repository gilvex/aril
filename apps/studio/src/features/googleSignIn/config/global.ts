import type { GoogleApi } from '../types/googleApi.ts'
declare global {
  interface Window {
    google?: GoogleApi
  }
}
