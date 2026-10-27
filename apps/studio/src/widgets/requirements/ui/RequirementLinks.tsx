import { ArrowUpRight, X, Workflow, PanelsTopLeft, PenTool } from 'lucide-react'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import type { RequirementDetailsProps } from '../types/requirementDetailsProps.ts'
import { useScopeLinks } from '../model/useScopeLinks.ts'
import { scopeTargetKey } from '../utils/scopeTargetKey.ts'
export function RequirementLinks(props: RequirementDetailsProps) {
  const { workspace, current, openWork } = props
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'
  const { targets, linked, add, remove } = useScopeLinks(props)
  return (
    <section className="req-links">
      <h3>{t('Connected work')}</h3>
      {linked.map(({ link, target }) => (
        <div className="scope-link-row" key={scopeTargetKey(link)}>
          <button
            className="req-board-link"
            disabled={!target}
            onClick={() => openWork(link)}
          >
            {link.kind === 'canvas' ? (
              <Workflow size={18} />
            ) : link.kind === 'design' ? (
              <PenTool size={18} />
            ) : (
              <PanelsTopLeft size={18} />
            )}
            <span>
              <strong>{target?.label || t('Unavailable target')}</strong>
              <small>
                {target
                  ? t(
                      link.kind === 'canvas'
                        ? 'Blueprint'
                        : link.kind === 'wireframes'
                          ? 'Wireframes'
                          : 'Design',
                    ) +
                    ' / ' +
                    (target.boardId
                      ? workspace.boards.find(
                          (board) => board.id === target.boardId,
                        )?.name
                      : t('Workspace-wide'))
                  : t('The linked work was removed.')}
              </small>
            </span>
            <ArrowUpRight size={16} />
          </button>
          <button
            className="icon-button"
            disabled={readOnly}
            aria-label={t('Remove connection')}
            onClick={() => remove(scopeTargetKey(link))}
          >
            <X size={14} />
          </button>
        </div>
      ))}
      {!linked.length && (
        <p>{t('Connect this outcome to a blueprint, wireframe, or design.')}</p>
      )}
      <label className="req-link-picker">
        <span>{t('Connect work')}</span>
        <StudioSelect
          disabled={readOnly || (current.links?.length || 0) >= 100}
          aria-label={t('Connect work')}
          value=""
          onChange={add}
        >
          <option value="" disabled>
            {t('Choose visual work…')}
          </option>
          {targets
            .filter(
              (target) =>
                !linked.some(({ link }) => scopeTargetKey(link) === target.key),
            )
            .map((target) => (
              <option key={target.key} value={target.key}>
                {t(
                  target.kind === 'canvas'
                    ? 'Blueprint'
                    : target.kind === 'wireframes'
                      ? 'Wireframes'
                      : 'Design',
                )}{' '}
                /{' '}
                {target.boardId
                  ? workspace.boards.find(
                      (board) => board.id === target.boardId,
                    )?.name + ' / '
                  : ''}
                {target.label}
              </option>
            ))}
        </StudioSelect>
      </label>
    </section>
  )
}
