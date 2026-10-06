import { useTranslation } from '@/shared/i18n/index.ts'
import { useBlueprintInspectorHandlers } from '../model/useBlueprintInspectorHandlers.tsx'

import { ResizableInspector } from '@/widgets/board/ui/ResizableInspector.tsx'
import { X } from 'lucide-react'

import { BlueprintEdgeDetails } from './BlueprintEdgeDetails.tsx'
import { BlueprintMultiSelection } from './BlueprintMultiSelection.tsx'
import { BlueprintNodeDetails } from './BlueprintNodeDetails.tsx'
import { BlueprintOverview } from './BlueprintOverview.tsx'

import type { BlueprintInspectorProps } from '../types/blueprintInspectorProps.ts'
export function BlueprintInspector({
  selectedNodes,
  node,
  edge,
  setInspectorOpen,
  inspectorToggle,
  checkpoint,
  update,
  board,
  selectedIds,
  onDelete,
  editField,
  updateNode,
  openRequirement,
  requirements,
  setSelected,
  removeNode,
  setSelectedEdge,
}: BlueprintInspectorProps) {
  const { t } = useTranslation()

  const { handleCloseBoardDetailsClick } = useBlueprintInspectorHandlers({
    setInspectorOpen,
    inspectorToggle,
  })
  return (
    <ResizableInspector id="board-inspector">
      <div className="inspector-heading">
        <span>
          {selectedNodes.length > 1
            ? t('{{count}} nodes selected', { count: selectedNodes.length })
            : node
              ? t('Node details')
              : edge
                ? t('Connection')
                : t('Board overview')}
        </span>
        <button
          className="icon-button"
          aria-label={t('Close board details')}
          onClick={handleCloseBoardDetailsClick}
        >
          <X size={16} />
        </button>
      </div>
      {selectedNodes.length > 1 ? (
        <BlueprintMultiSelection
          selectedNodes={selectedNodes}
          checkpoint={checkpoint}
          update={update}
          board={board}
          selectedIds={selectedIds}
          onDelete={onDelete}
        />
      ) : node ? (
        <BlueprintNodeDetails
          node={node}
          editField={editField}
          updateNode={updateNode}
          openRequirement={openRequirement}
          requirements={requirements}
          update={update}
          board={board}
          setSelected={setSelected}
          removeNode={removeNode}
        />
      ) : edge ? (
        <BlueprintEdgeDetails
          board={board}
          edge={edge}
          editField={editField}
          update={update}
          setSelectedEdge={setSelectedEdge}
        />
      ) : (
        <BlueprintOverview board={board} update={update} />
      )}
    </ResizableInspector>
  )
}
