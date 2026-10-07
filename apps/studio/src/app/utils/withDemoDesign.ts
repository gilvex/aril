import { createDesignTemplate } from '@pomegranate/domain/design'
import type { Workspace } from '@pomegranate/domain/workspace'

export function withDemoDesign(workspace: Workspace): Workspace {
  // An explicit empty collection means the visitor deliberately removed pages.
  if (workspace.design.pages !== undefined) return workspace
  let index = 0
  return {
    ...workspace,
    design: {
      ...workspace.design,
      pages: [
        {
          id: 'demo-design-dashboard',
          name: 'Server dashboard · desktop & mobile',
          nodes: createDesignTemplate(
            workspace.design,
            (key) => key,
            0,
            () => `demo-design-layer-${++index}`,
          ),
        },
      ],
    },
  }
}
