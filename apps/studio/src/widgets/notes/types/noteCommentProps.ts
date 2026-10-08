import type { Workspace } from '@pomegranate/domain/workspace'
export type NoteCommentProps = {
  comment: NonNullable<Workspace['noteComments']>[number]
  profileId: string
  readOnly: boolean
  resolve: (id: string) => void
  remove: (id: string) => void
}
