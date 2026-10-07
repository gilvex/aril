import type { Json } from '../types/json.ts'
export function designWorkspaceOf(design: Record<string, Json>) {
  return {
    ...design,
    ...(design.pages
      ? {
          pages: Object.values(
            design.pages as Record<string, Record<string, Json>>,
          ).map((page) => ({
            ...page,
            nodes: Object.values(page.nodes as object),
          })),
        }
      : {}),
  }
}
