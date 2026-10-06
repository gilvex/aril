import { scriptPromiseState } from '@/features/googleSignIn/config/scriptPromiseState.ts'
export function loadGoogle() {
  return (scriptPromiseState.value ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromiseState.value = undefined
      script.remove()
      reject(
        new Error(
          'Could not load Google sign-in. Check your connection and try again.',
        ),
      )
    }
    document.head.append(script)
  }))
}
