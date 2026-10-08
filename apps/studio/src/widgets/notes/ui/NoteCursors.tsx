import { PeerCursor } from '@/entities/collaboration/index.ts'
import type { NoteSurfaceProps } from '../types/noteSurfaceProps.ts'
import { useNoteGeometry } from '../model/useNoteGeometry.ts'
export function NoteCursors({
  editor,
  surface,
  peers,
  model,
}: NoteSurfaceProps) {
  const [width, height, scroll] = useNoteGeometry(
    surface === 'edit' ? editor.editor : editor.reader,
  )
  return (
    <div className="note-presence-overlay">
      {peers.map((peer) => {
        const note = peer.note
        if (
          peer.view !== 'notes' ||
          note?.id !== model.note.id ||
          note.surface !== surface ||
          !note.pointer
        )
          return null
        return (
          <PeerCursor
            key={peer.clientId}
            profile={peer.profile}
            chat={peer.chat}
            x={note.pointer.x * width}
            y={note.pointer.y * height - scroll}
          />
        )
      })}
    </div>
  )
}
