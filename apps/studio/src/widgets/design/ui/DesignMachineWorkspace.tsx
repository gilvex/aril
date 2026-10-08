import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
} from '@xyflow/react'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
import { DesignMachineSimulator } from './DesignMachineSimulator.tsx'
import { useDesignMachineWorkspace } from '../model/useDesignMachineWorkspace.ts'
export function DesignMachineWorkspace({ model }: DesignEditorProps) {
  const {
    machine,
    nodes,
    edges,
    add,
    changes,
    connect,
    stateClick,
    transitionClick,
    test,
    readOnly,
    t,
  } = useDesignMachineWorkspace({ model })
  if (!machine) return null
  return (
    <div className="design-machine-workspace">
      <header>
        <strong>{machine.name}</strong>
        <span>{t('Connect states to add transitions.')}</span>
        <button
          className="button"
          disabled={readOnly || Object.keys(machine.states).length >= 100}
          onClick={add}
        >
          {t('Add state')}
        </button>
        <button className="button primary" onClick={test}>
          {t('Test machine')}
        </button>
      </header>
      <div className="design-machine-flow">
        <ReactFlowProvider>
          <ReactFlow
            key={machine.id}
            nodes={nodes}
            edges={edges}
            fitView
            fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
            minZoom={0.2}
            maxZoom={2}
            onNodesChange={changes}
            onConnect={connect}
            onNodeClick={stateClick}
            onEdgeClick={transitionClick}
            nodesDraggable={!readOnly}
            nodesConnectable={
              !readOnly && Object.keys(machine.transitions).length < 300
            }
            deleteKeyCode={null}
          >
            <Background gap={20} color="var(--line)" />
            <Controls showInteractive={false} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
      {model.simulation?.machineId === machine.id && (
        <DesignMachineSimulator model={model} />
      )}
    </div>
  )
}
