export function isDemoMode(search = location.search) {
  return new URLSearchParams(search).get('demo') === '1'
}
