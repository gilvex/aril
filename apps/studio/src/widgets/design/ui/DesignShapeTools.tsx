import { StudioActionButton } from '@/shared/ui/index.tsx'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { designTools } from '../config/designTools.ts'
import { DesignInsertMenu } from './DesignInsertMenu.tsx'
import { DesignCanvasActions } from './DesignCanvasActions.tsx'
import type { DesignToolbarProps } from '../types/designToolbarProps.ts'
export function DesignShapeTools(props: DesignToolbarProps) {
  const { t } = useTranslation()
  const role = useWorkspaceRole()
  const disabled =
    role === 'viewer' || role === null || props.model.page.nodes.length >= 500
  return (
    <>
      {designTools
        .filter((item) =>
          ['Desktop frame', 'Rectangle', 'Ellipse', 'Text'].includes(
            item.label,
          ),
        )
        .map(({ kind, label, icon: Icon }) => (
          <StudioActionButton
            key={label}
            disabled={disabled}
            title={t(label)}
            aria-label={t(label)}
            onClick={() => props.add(kind)}
          >
            <Icon size={18} />
          </StudioActionButton>
        ))}
      {!disabled && <DesignInsertMenu {...props} />}
      {role !== 'viewer' && <DesignCanvasActions model={props.model} />}
    </>
  )
}
