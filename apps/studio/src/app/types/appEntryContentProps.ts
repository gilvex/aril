import type { useAppController } from '../model/useAppController.ts'
import type { StudioSummary } from '@aril/domain/studios'
export type AppEntryContentProps = {
  model: ReturnType<typeof useAppController>
  onOpen: (studio: StudioSummary) => void
}
