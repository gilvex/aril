import type { ReactNode } from 'react'
import type { DesignEditorProps } from './designEditorProps.ts'

export type DesignMobileToolsProps = DesignEditorProps & {
  children: ReactNode
  onOpenChange: (open: boolean) => void
}
