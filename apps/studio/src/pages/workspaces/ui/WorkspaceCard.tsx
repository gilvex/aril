import { memo, useCallback } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Avatar } from '@/entities/collaboration/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { WorkspacePreview } from './WorkspacePreview.tsx'
import { formatWorkspaceVisit } from '../utils/formatWorkspaceVisit.ts'
import type { WorkspaceCardProps } from '../types/workspaceCardProps.ts'

export const WorkspaceCard = memo(function WorkspaceCard({
  studio,
  visited,
  onOpen,
}: WorkspaceCardProps) {
  const { t, i18n } = useTranslation()
  const open = useCallback(() => onOpen(studio), [onOpen, studio])
  return (
    <button
      className="workspace-card"
      onClick={open}
      aria-label={t('Open {{name}}', { name: studio.name })}
    >
      <WorkspacePreview studio={studio} />
      <div className="workspace-card-content">
        <div className="workspace-card-title">
          <h2>{studio.name}</h2>
          <span className={`workspace-role role-${studio.role}`}>
            {t(studio.role === 'owner' ? 'Owner' : 'Member')}
          </span>
          <ArrowUpRight size={16} className="workspace-open-icon" />
        </div>
        <div className="workspace-card-meta">
          <span
            title={
              visited
                ? new Date(visited).toLocaleString(i18n.resolvedLanguage)
                : undefined
            }
          >
            {visited
              ? t('Opened {{time}}', {
                  time: formatWorkspaceVisit(
                    visited,
                    i18n.resolvedLanguage || 'en',
                  ),
                })
              : t('Not opened on this device')}
          </span>
          <span
            className="workspace-members"
            aria-label={t('{{count}} workspace members', {
              count: studio.memberCount,
            })}
            title={studio.members.map((member) => member.name).join(', ')}
          >
            {studio.members.map((member) => (
              <Avatar key={member.id} profile={{ ...member, avatar: '' }} />
            ))}
            {studio.memberCount > 3 && (
              <span className="workspace-member-more">
                +{studio.memberCount - 3}
              </span>
            )}
          </span>
        </div>
      </div>
    </button>
  )
})
