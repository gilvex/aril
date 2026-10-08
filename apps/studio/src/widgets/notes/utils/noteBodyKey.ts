export function noteBodyKey(body: string): string {
  let hash = 2166136261
  for (let index = 0; index < body.length; index++) {
    hash ^= body.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return `${body.length}:${hash >>> 0}`
}
