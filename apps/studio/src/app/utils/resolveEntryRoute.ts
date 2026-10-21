export function resolveEntryRoute(href: string, productSite: boolean) {
  const url = new URL(href)
  const path = url.pathname.replace(/\/$/, '') || '/'
  const hash = new URLSearchParams(url.hash.slice(1))
  const appIntent =
    [
      'demo',
      'workspace',
      'board',
      'view',
      'account',
      'authError',
      'signin',
    ].some((key) => url.searchParams.has(key)) ||
    ['invite', 'guest', 'transfer'].some((key) => hash.has(key))
  if (path === '/' && (appIntent || !productSite)) url.pathname = '/app'
  if (!productSite) {
    if (path === '/changelog') {
      url.pathname = '/app'
      url.hash = ''
    }
    if (url.searchParams.get('demo') === '1') {
      for (const key of ['demo', 'workspace', 'board', 'view', 'canvas'])
        url.searchParams.delete(key)
      if (url.pathname.startsWith('/w/demo')) url.pathname = '/app'
    }
  }
  const page =
    productSite && url.pathname === '/' && !appIntent
      ? 'landing'
      : productSite && path === '/changelog'
        ? 'changelog'
        : 'studio'
  return { page, href: url.pathname + url.search + url.hash }
}
