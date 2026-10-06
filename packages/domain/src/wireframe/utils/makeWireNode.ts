import { sizes } from '../config/sizes.ts'
import { wireLabels } from '../config/wireLabels.ts'
import type { WireKind } from '../types/wireKind.ts'
import type { WireNode } from '../types/wireNode.ts'
export function makeWireNode(
  kind: WireKind,
  id: string,
  position: WireNode['position'],
  parentId?: string,
): WireNode {
  const [width, height] = sizes[kind]
  return {
    id,
    type: 'wireframe',
    position,
    width,
    height,
    ...(parentId && kind !== 'screen' ? { parentId } : {}),
    data: {
      kind,
      title:
        kind === 'screen'
          ? 'Untitled screen'
          : kind === 'button'
            ? 'Continue'
            : wireLabels[kind],
      content:
        kind === 'card'
          ? 'A little context for this section.'
          : kind === 'input'
            ? 'Placeholder…'
            : '',
      tone: kind === 'button' ? 'accent' : 'plain',
    },
  }
}
