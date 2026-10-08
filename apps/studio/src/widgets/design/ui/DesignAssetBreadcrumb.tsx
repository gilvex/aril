import { useCallback } from 'react'
import { ArrowLeft, Component, Workflow, Variable } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignAssetBreadcrumb({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const { patch } = model
  const open = useCallback(
    () => patch({ layers: true, leftTab: 'library', dockActive: 'left' }),
    [patch],
  )
  const Icon = model.component
    ? Component
    : model.libraryView === 'machine'
      ? Workflow
      : Variable
  const title =
    model.component?.name ||
    (model.machineId ? model.library.machines[model.machineId]?.name : '') ||
    t('Variables')
  return (
    <div className="design-asset-breadcrumb">
      <button
        className="icon-button"
        aria-label={t('Back to canvas')}
        onClick={model.closeAsset}
      >
        <ArrowLeft size={16} />
      </button>
      <Icon size={16} />
      <button onClick={open}>
        {title}
        {model.variant && <small> / {model.variant.name}</small>}
      </button>
    </div>
  )
}
