export function libraryMapColor(name: string) {
  const colors = [
    '#67bdb5',
    '#b69ae5',
    '#7fa5ee',
    '#e2b86b',
    '#db85a2',
    '#8abb80',
  ]
  const defaults = [
    'Foundations',
    'Core UI',
    'Hosting',
    'Billing',
    'Admin',
    'Local',
  ]
  const known = defaults.indexOf(name)
  if (known >= 0) return colors[known]
  let hash = 0
  for (const character of name)
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  return colors[hash % colors.length]
}
