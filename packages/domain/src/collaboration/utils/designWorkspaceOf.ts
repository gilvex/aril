import type { Json } from '../types/json.ts'
export function designWorkspaceOf(design: Record<string, Json>) {
  const library = design.library as Record<string, Json> | undefined
  return {
    ...design,
    ...(library
      ? {
          library: {
            ...library,
            components: Object.fromEntries(
              Object.entries(
                (library.components || {}) as Record<
                  string,
                  Record<string, Json>
                >,
              ).map(([id, component]) => [
                id,
                {
                  ...component,
                  variants: Object.fromEntries(
                    Object.entries(
                      component.variants as Record<
                        string,
                        Record<string, Json>
                      >,
                    ).map(([key, variant]) => [
                      key,
                      {
                        ...variant,
                        nodes: Object.values(variant.nodes as object),
                      },
                    ]),
                  ),
                },
              ]),
            ),
          },
        }
      : {}),
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
