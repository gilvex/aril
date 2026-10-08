export function controlFingerprint(value: string) {
  let hash = 2166136261
  for (let i = 0; i < value.length; i++)
    hash = Math.imul(hash ^ value.charCodeAt(i), 16777619)
  return `${value.length}:${hash >>> 0}`
}
