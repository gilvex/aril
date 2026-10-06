export type AccountConnectionHandlersProps = {
  onProfile: (
    profile: import('@pomegranate/domain/collaboration').Profile,
  ) => void
  refresh: () => Promise<void>
}
