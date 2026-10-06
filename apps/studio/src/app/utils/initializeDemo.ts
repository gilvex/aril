import { apiTransport } from '@/shared/api/apiTransport.ts'
import { createDemoTransport } from './createDemoTransport.ts'

export function initializeDemo() {
  apiTransport.request = createDemoTransport({
    getItem: (key) => sessionStorage.getItem(key),
    setItem: (key, value) => sessionStorage.setItem(key, value),
  })
  if (!new URLSearchParams(location.search).has('workspace')) {
    const url = new URL(location.href)
    url.searchParams.set('workspace', 'demo')
    url.searchParams.set('board', 'layers')
    history.replaceState(null, '', url.pathname + url.search)
  }
}
