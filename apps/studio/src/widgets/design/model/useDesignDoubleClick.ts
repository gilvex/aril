import { useCallback, type MouseEvent } from 'react'
import type { DesignEditorModel } from '../types/designEditorModel.ts'
import type { DesignFlowNode } from '../types/designFlowNode.ts'
export function useDesignDoubleClick(
  model: DesignEditorModel,
  canEdit: boolean,
) {
  return useCallback(
    (_event: MouseEvent, node: DesignFlowNode) => {
      model.patch({
        selection: [node.id],
        inspector: true,
        styles: false,
        editingId:
          canEdit && ['text', 'button'].includes(node.data.element.kind)
            ? node.id
            : null,
      })
    },
    [model, canEdit],
  )
}
