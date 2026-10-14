import type { Workspace } from '@aril/domain/workspace'
export type NoteCommentProps = {
  comment: NonNullable<Workspace['noteComments']>[number]
  profileId: string
  readOnly: boolean
  resolve: (id: string) => void
  remove: (id: string) => void
}
