import type { Workspace } from '../../workspace/index.ts'
import { indexed } from './indexed.ts'
export function designDocumentOf(design: Workspace['design']) {
  return {
    ...design,
    ...(design.pages
      ? {
          pages: Object.fromEntries(
            design.pages.map((page) => [
              page.id,
              { ...page, nodes: indexed(page.nodes) },
            ]),
          ),
        }
      : {}),
  }
}
