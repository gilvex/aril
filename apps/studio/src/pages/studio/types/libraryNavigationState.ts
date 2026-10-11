import type { DesignEditorState } from '@/widgets/design/index.ts'
export type LibraryNavigationState = {
  boardId: string | null
  tab: 'graph' | 'variables'
  target: Partial<DesignEditorState> | null
}
