export type RevisionHistoryItemProps = {
  s: { revision: number; savedAt: string }
  studio: import('@pomegranate/domain/studios').StudioSummary
  state: ReturnType<typeof import('@/entities/workspace/index.ts').useWorkspace>
  change: (
    update: (
      value: import('@pomegranate/domain/workspace').Workspace,
    ) => import('@pomegranate/domain/workspace').Workspace,
    record?: boolean,
  ) => void
  setModal: (
    value:
      | import('../types/studioState.ts').StudioState['modal']
      | ((
          current: import('../types/studioState.ts').StudioState['modal'],
        ) => import('../types/studioState.ts').StudioState['modal']),
  ) => void
  setNotice: (
    value:
      | import('../types/studioState.ts').StudioState['notice']
      | ((
          current: import('../types/studioState.ts').StudioState['notice'],
        ) => import('../types/studioState.ts').StudioState['notice']),
  ) => void
}
