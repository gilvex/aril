import type { ReactElement, RefObject } from 'react'
import type { EditorMenuAction } from './editorMenuAction.ts'
export type EditorMenuProps = {
  children: ReactElement
  actions: EditorMenuAction[]
  label?: string
  disabled?: boolean
  focusAfterClose?: RefObject<HTMLInputElement | null>
}
