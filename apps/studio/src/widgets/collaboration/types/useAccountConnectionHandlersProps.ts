export type AccountConnectionHandlersProps = {
  onProfile: (
    profile: import('@aril/domain/collaboration').Profile,
  ) => void
  refresh: () => Promise<void>
}
