import { useCallback, useMemo } from 'react'
import { DesignLibraryPage } from './DesignLibraryPage.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { StudioSelect } from '@/shared/ui/index.tsx'
import type { SelectChange } from '@/shared/types/selectChange.ts'
import {
  activeBoardSections,
  type Workspace,
} from '@pomegranate/domain/workspace'
import type { StudioContentProps } from '../types/studioContentProps.ts'
export function StudioLibrary({
  workspace,
  studio,
  change,
  state,
  multiplayer,
  sendPresence,
  libraryNavigation,
}: StudioContentProps) {
  const { t } = useTranslation()
  const { boardId, open, design: navigateDesign, tab } = libraryNavigation
  const board = workspace.boards.find((item) => item.id === boardId)
  const design = useMemo(
    () =>
      board
        ? board.design || { ...workspace.design, pages: [], library: undefined }
        : workspace.design,
    [board, workspace.design],
  )
  const update = useCallback(
    (design: Workspace['design']) =>
      change((current) =>
        board
          ? {
              ...current,
              boards: current.boards.map((item) =>
                item.id === board.id
                  ? {
                      ...item,
                      design,
                      sections: [
                        ...new Set([
                          ...activeBoardSections(item),
                          'design' as const,
                        ]),
                      ],
                    }
                  : item,
              ),
            }
          : { ...current, design },
      ),
    [change, board],
  )
  const select = useCallback(
    (event: SelectChange) => open(event.target.value || null, tab),
    [open, tab],
  )
  const peers = useMemo(
    () =>
      multiplayer.peers.filter(
        (peer) => (peer.boardId || null) === (board?.id || null),
      ),
    [multiplayer.peers, board?.id],
  )
  const initialEditorState = useMemo(() => ({ libraryTab: tab }), [tab])
  const navigation = (
    <label>
      {t('Library source')}
      <StudioSelect
        aria-label={t('Library source')}
        value={board?.id || ''}
        onChange={select}
      >
        <option value="">{t('Workspace design')}</option>
        {workspace.boards.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </StudioSelect>
    </label>
  )
  return (
    <DesignLibraryPage
      key={board ? `board:${board.id}` : 'workspace'}
      workspaceId={studio.id + (board ? ':' + board.id : '')}
      design={design}
      update={update}
      saveState={state.saveState}
      peers={peers}
      following={null}
      sendPresence={sendPresence}
      navigation={navigation}
      initialEditorState={initialEditorState}
      onNavigateDesign={navigateDesign}
    />
  )
}
