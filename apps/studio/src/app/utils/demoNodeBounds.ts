import type { Idea } from '@pomegranate/domain/workspace'

export function demoNodeBounds(node: Idea) {
  // Deliberately generous for wrapped titles/descriptions, fonts and presence badges.
  return {
    x: node.position.x,
    y: node.position.y,
    width: 214,
    height:
      180 +
      Math.ceil(node.data.title.length / 18) * 24 +
      Math.ceil(node.data.description.length / 24) * 20,
  }
}
