import { useTranslation } from '@/shared/i18n/index.ts'
import { useWireframeInspectorHandlers } from '../model/useWireframeInspectorHandlers.tsx'

import { ResizableInspector } from '@/widgets/board/ui/ResizableInspector.tsx'
import { wireLabels } from '@pomegranate/domain/wireframe'
import { X } from 'lucide-react'

import { WireframeEdgeDetails } from './WireframeEdgeDetails.tsx'
import { WireframeMultiSelection } from './WireframeMultiSelection.tsx'
import { WireframeNodeDetails } from './WireframeNodeDetails.tsx'
import { WireframeOverview } from './WireframeOverview.tsx'
import { WireframePreviewDetails } from './WireframePreviewDetails.tsx'

import type { WireframeInspectorProps } from '../types/wireframeInspectorProps.ts'
export function WireframeInspector({
  preview,
  selected,
  node,
  edge,
  setInspectorOpen,
  inspectorToggle,
  previewMessage,
  graph,
  focus,
  setPreviewMessage,
  setPreview,
  save,
  selection,
  duplicate,
  setSelection,
  editField,
  editData,
  editNode,
  screens,
  trigger,
  setTrigger,
  targetId,
  setTargetId,
  connect,
  setEdgeId,
  add,
}: WireframeInspectorProps) {
  const { t } = useTranslation()

  const { handleCloseWireframeDetailsClick } = useWireframeInspectorHandlers({
    setInspectorOpen,
    inspectorToggle,
  })
  return (
    <ResizableInspector id="wireframe-inspector" className="wire-inspector">
      <div className="inspector-heading">
        <span>
          {preview
            ? t('Follow the flow')
            : selected.length > 1
              ? t('{{count}} blocks selected', { count: selected.length })
              : node
                ? t('{{value}} details', {
                    value: t(wireLabels[node.data.kind]),
                  })
                : edge
                  ? t('Interaction')
                  : t('Wireframe kit')}
        </span>
        <button
          className="icon-button"
          aria-label={t('Close wireframe details')}
          onClick={handleCloseWireframeDetailsClick}
        >
          <X size={16} />
        </button>
      </div>
      {preview ? (
        <WireframePreviewDetails
          previewMessage={previewMessage}
          node={node}
          graph={graph}
          focus={focus}
          setPreviewMessage={setPreviewMessage}
          setPreview={setPreview}
        />
      ) : selected.length > 1 ? (
        <WireframeMultiSelection
          save={save}
          graph={graph}
          selection={selection}
          duplicate={duplicate}
          setSelection={setSelection}
        />
      ) : node ? (
        <WireframeNodeDetails
          node={node}
          editField={editField}
          editData={editData}
          editNode={editNode}
          screens={screens}
          graph={graph}
          trigger={trigger}
          setTrigger={setTrigger}
          targetId={targetId}
          setTargetId={setTargetId}
          connect={connect}
          setEdgeId={setEdgeId}
          setSelection={setSelection}
          duplicate={duplicate}
          save={save}
          selection={selection}
        />
      ) : edge ? (
        <WireframeEdgeDetails
          graph={graph}
          edge={edge}
          editField={editField}
          save={save}
          focus={focus}
          setEdgeId={setEdgeId}
        />
      ) : (
        <WireframeOverview
          graph={graph}
          setEdgeId={setEdgeId}
          setSelection={setSelection}
          add={add}
          screens={screens}
          focus={focus}
        />
      )}
    </ResizableInspector>
  )
}
