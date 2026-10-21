export function suggestUsername(name: string, suffix = '') {
  const normalized = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  const base =
    /^[a-z]/.test(normalized) && !normalized.startsWith('user_')
      ? normalized
      : 'member'
  const ending = suffix.replace(/[^a-z0-9]/g, '').slice(0, 6)
  const suggestion = ending
    ? `${base.slice(0, 23)}_${ending}`
    : base.slice(0, 30)
  return suggestion.length >= 3 ? suggestion : `${suggestion}_studio`
}
