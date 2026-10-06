import { useTranslation } from '@/shared/i18n/index.ts'
import { useRequirementResize } from '../model/useRequirementResize.ts'
import type { RequirementEditorProps } from '../types/requirementEditorProps.ts'
import { RequirementDetails } from './RequirementDetails.tsx'
export function RequirementEditor({
  model,
  change,
  openBoard,
}: RequirementEditorProps) {
  const { t } = useTranslation()
  const resize = useRequirementResize({ model })
  if (!model.current) return null
  return (
    <aside
      className="req-editor"
      ref={resize.panel}
      tabIndex={-1}
      aria-label={t('Requirement details')}
      style={{ width: model.detailWidth }}
    >
      <div
        className="req-editor-resize"
        role="separator"
        tabIndex={0}
        aria-label={t('Resize details panel')}
        aria-orientation="vertical"
        aria-valuemin={360}
        aria-valuemax={850}
        aria-valuenow={model.detailWidth}
        onPointerDown={resize.start}
        onPointerMove={resize.move}
        onPointerUp={resize.end}
        onLostPointerCapture={resize.end}
        onKeyDown={resize.keys}
        onDoubleClick={resize.reset}
      />
      <RequirementDetails
        current={model.current}
        selectRequirement={model.selectRequirement}
        peopleFor={model.peopleFor}
        profile={model.profile}
        fieldProps={model.fieldProps}
        update={model.update}
        fieldHint={model.fieldHint}
        workspace={model.workspace}
        openBoard={openBoard}
        change={change}
      />
    </aside>
  )
}
