import { useWorkspace } from '@/entities/workspace/index.ts'

export type StudioNotesProps = {
  workspace: ReturnType<typeof useWorkspace>['workspace']
  change: ReturnType<typeof useWorkspace>['change']
}
