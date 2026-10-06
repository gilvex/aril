export type StudioHandlersProps = {
  followId: string | null
  setFollowId: (
    value:
      | import('../types/studioState.ts').StudioState['followId']
      | ((
          current: import('../types/studioState.ts').StudioState['followId'],
        ) => import('../types/studioState.ts').StudioState['followId']),
  ) => void
}
