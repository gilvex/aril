import type { Workspace } from '../../workspace/index.ts'
import { indexed } from './indexed.ts'
export function designDocumentOf(design: Workspace['design']) {
  return {
    ...design,
    ...(design.library
      ? {
          library: {
            ...design.library,
            components: Object.fromEntries(
              Object.entries(design.library.components).map(
                ([id, component]) => [
                  id,
                  {
                    ...component,
                    variants: Object.fromEntries(
                      Object.entries(component.variants).map(
                        ([key, variant]) => [
                          key,
                          { ...variant, nodes: indexed(variant.nodes) },
                        ],
                      ),
                    ),
                  },
                ],
              ),
            ),
          },
        }
      : {}),
    ...(design.pages
      ? {
          pages: Object.fromEntries(
            design.pages.map((page) => [
              page.id,
              {
                ...page,
                strokes: page.strokes || {},
                nodes: indexed(page.nodes),
              },
            ]),
          ),
        }
      : {}),
  }
}
