import type { DesignEditorProps } from './designEditorProps.ts'
import type { DesignBoardProps } from './designBoardProps.ts'
export type DesignPanelsProps = DesignEditorProps &
  Pick<DesignBoardProps, 'design' | 'update'> & { compact: boolean }
