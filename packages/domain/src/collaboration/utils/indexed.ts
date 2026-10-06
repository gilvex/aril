export function indexed(items: { id: string }[]) {
  return Object.fromEntries(items.map((item) => [item.id, item]))
}
