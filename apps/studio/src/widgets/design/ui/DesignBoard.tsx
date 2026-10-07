import { ReactFlowProvider } from '@xyflow/react'
import { DesignCanvas } from './DesignCanvas.tsx'
import type { DesignBoardProps } from '../types/designBoardProps.ts'
import '@xyflow/react/dist/style.css'
import '../design.css'
import '../designEditor.css'
import '../designCompact.css'
export function DesignBoard(props: DesignBoardProps) {
  return (
    <ReactFlowProvider>
      <DesignCanvas {...props} />
    </ReactFlowProvider>
  )
}
