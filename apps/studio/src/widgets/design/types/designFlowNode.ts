import type { DesignElement } from '@pomegranate/domain/design'
import type { Profile } from '@pomegranate/domain/collaboration'
import type { Node } from '@xyflow/react'
export type DesignFlowNode = Node<
  {
    element: DesignElement
    editors: Profile[]
    editing: boolean
    editText: (id: string, text: string) => void
    finishEditing: () => void
  },
  'designElement'
>
