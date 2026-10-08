import { StudioNotes } from './StudioNotes.tsx'
import type { StudioContentProps } from '../types/studioContentProps.ts'
export function StudioNotebook({
  studio,
  workspace,
  change,
  multiplayer,
  followed,
  sendPresence,
  state,
}: StudioContentProps) {
  return (
    <StudioNotes
      key={studio.id}
      workspace={workspace}
      change={change}
      workspaceId={studio.id}
      profile={multiplayer.profile}
      peers={multiplayer.peers}
      sendPresence={sendPresence}
      followed={followed}
      noteText={multiplayer.noteText}
      changeText={state.changeText}
    />
  )
}
