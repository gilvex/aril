export type FollowPersonHandlersProps = {
  onFollow: (id: string | null) => void
  followId: string | null
  person:
    | import('@pomegranate/domain/collaboration').Presence
    | {
        profile: import('@pomegranate/domain/collaboration').Profile
        clientId: string
        view: string
        following: null
      }
  setPanel: (panel: import('../types/collaborationBarPanel.ts').Panel) => void
}
