import type { StudioPreviewNode } from '@pomegranate/domain/studios'

export function previewViewBox(nodes: StudioPreviewNode[]) {
  const left = Math.min(...nodes.map((node) => node.x)) - 48
  const top = Math.min(...nodes.map((node) => node.y)) - 48
  const right = Math.max(...nodes.map((node) => node.x)) + 288
  const bottom = Math.max(...nodes.map((node) => node.y)) + 158
  return `${left} ${top} ${right - left} ${bottom - top}`
}
