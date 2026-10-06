export type UseStudioControllerProps = {
  initial: import('@pomegranate/domain/workspace').Envelope
  studio: import('@pomegranate/domain/studios').StudioSummary
  initialProfile: import('@pomegranate/domain/collaboration').Profile
  recovery: import('@pomegranate/domain/freshness').RecoveryDraft | undefined
}
