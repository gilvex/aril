import type { DesignElement } from '@aril/domain/design'
import type { Profile } from '@aril/domain/collaboration'
import type { Node } from '@xyflow/react'
export type DesignFlowNode = Node<
  {
    element: DesignElement
    clips: DesignElement[]
    clipId: string
    maskSource: boolean
    editors: Profile[]
    editing: boolean
    editText: (id: string, text: string) => void
    finishEditing: () => void
  },
  'designElement'
>
