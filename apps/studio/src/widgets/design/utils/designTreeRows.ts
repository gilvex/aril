import type { DesignElement } from '@pomegranate/domain/design'
export function designTreeRows(
  nodes: DesignElement[],
  collapsed: string[] = [],
  descending = true,
) {
  const result: { node: DesignElement; depth: number }[] = []
  const visited = new Set<string>()
  const sorted = [...nodes].sort((a, b) =>
    descending ? b.order - a.order : a.order - b.order,
  )
  const visit = (parentId: string | undefined, depth: number) => {
    for (const node of sorted.filter((item) => item.parentId === parentId)) {
      if (visited.has(node.id)) continue
      visited.add(node.id)
      result.push({ node, depth })
      if (!collapsed.includes(node.id)) visit(node.id, depth + 1)
    }
  }
  visit(undefined, 0)
  return result
}
