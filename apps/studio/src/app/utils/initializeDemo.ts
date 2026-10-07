import { apiTransport } from '@/shared/api/apiTransport.ts'
import { createDemoTransport } from './createDemoTransport.ts'
import { readStudioRoute } from '@/shared/utils/readStudioRoute.ts'

export function initializeDemo() {
  apiTransport.request = createDemoTransport({
    getItem: (key) => sessionStorage.getItem(key),
    setItem: (key, value) => sessionStorage.setItem(key, value),
  })
  if (!readStudioRoute(location.pathname + location.search).workspaceId) {
    const url = new URL(location.href)
    url.searchParams.set('workspace', 'demo')
    url.searchParams.set('board', 'layers')
    history.replaceState(null, '', url.pathname + url.search)
  }
}
