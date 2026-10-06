export type UseRequirementsControllerProps = {
  workspace: import('@pomegranate/domain/workspace').Workspace
  selected: string | null
  onSelect: (id: string | null) => void
  sendPresence: (
    changes: {
      requirement:
        import('@pomegranate/domain/collaboration').RequirementPresence | null
    },
    force?: boolean,
  ) => void
  peers: import('@pomegranate/domain/collaboration').Presence[]
  profile: import('@pomegranate/domain/collaboration').Profile
  change: (
    fn: (
      w: import('@pomegranate/domain/workspace').Workspace,
    ) => import('@pomegranate/domain/workspace').Workspace,
  ) => void
}
