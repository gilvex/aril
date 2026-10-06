import { draftKey } from '@/entities/workspace/config/draftKey.ts'
export const scopedDraftKey = (workspaceId: string, profileId: string) =>
  `${draftKey}:${profileId}:${workspaceId}`
