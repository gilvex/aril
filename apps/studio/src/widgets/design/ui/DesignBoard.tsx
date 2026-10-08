import { ReactFlowProvider } from '@xyflow/react'
import { CanvasToolsProvider } from '@/features/canvasTools/index.ts'
import { DesignCanvas } from './DesignCanvas.tsx'
import type { DesignBoardProps } from '../types/designBoardProps.ts'
import '@xyflow/react/dist/style.css'
import '../design.css'
import '../designLibrary.css'
import '../designEditor.css'
import '../designCompact.css'
import '../designFloatingTools.css'
import '../designPanels.css'
export function DesignBoard(props: DesignBoardProps) {
  return (
    <ReactFlowProvider>
      <CanvasToolsProvider key={props.workspaceId}>
        <DesignCanvas {...props} />
      </CanvasToolsProvider>
    </ReactFlowProvider>
  )
}
