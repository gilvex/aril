export type FollowStatusProps = {
  followed: import('@pomegranate/domain/collaboration').Presence
  setFollowId: (
    value:
      | import('../types/studioState.ts').StudioState['followId']
      | ((
          current: import('../types/studioState.ts').StudioState['followId'],
        ) => import('../types/studioState.ts').StudioState['followId']),
  ) => void
}
