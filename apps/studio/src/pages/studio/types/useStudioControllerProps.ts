export type UseStudioControllerProps = {
  active?: boolean
  initial: import('@aril/domain/workspace').Envelope
  studio: import('@aril/domain/studios').StudioSummary
  initialProfile: import('@aril/domain/collaboration').Profile
  recovery: import('@aril/domain/freshness').RecoveryDraft | undefined
}
