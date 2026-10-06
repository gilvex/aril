import { wirePosition, type WireNode } from '@pomegranate/domain/wireframe'

export function wireConnectionSides(
  source: WireNode,
  target: WireNode,
  nodes: WireNode[],
) {
  const from = wirePosition(source, nodes),
    to = wirePosition(target, nodes)
  const backwards = to.x + target.width / 2 < from.x + source.width / 2
  return backwards
    ? { sourceSide: 'left' as const, targetSide: 'right' as const }
    : { sourceSide: 'right' as const, targetSide: 'left' as const }
}
