import { z } from 'zod'

export const wireKinds = [
  'screen',
  'text',
  'button',
  'input',
  'card',
  'image',
  'navigation',
] as const
const wireNode = z.object({
  id: z.string().min(1).max(100),
  type: z.literal('wireframe'),
  position: z.object({ x: z.number().finite(), y: z.number().finite() }),
  width: z.number().min(60).max(2400),
  height: z.number().min(32).max(2400),
  parentId: z.string().min(1).max(100).optional(),
  data: z.object({
    kind: z.enum(wireKinds),
    title: z.string().min(1).max(120),
    content: z.string().max(2000),
    tone: z.enum(['plain', 'soft', 'accent']),
  }),
})
export const wireframeSchema = z
  .object({
    nodes: z.array(wireNode).max(500),
    edges: z
      .array(
        z.object({
          id: z.string().min(1).max(100),
          source: z.string(),
          target: z.string(),
          label: z.string().max(120),
          type: z.literal('smoothstep'),
        }),
      )
      .max(1500),
  })
  .superRefine((graph, context) => {
    const nodes = new Map(graph.nodes.map((n) => [n.id, n]))
    if (
      nodes.size !== graph.nodes.length ||
      new Set(graph.edges.map((e) => e.id)).size !== graph.edges.length
    )
      context.addIssue({ code: 'custom', message: 'Duplicate wireframe IDs' })
    for (const node of graph.nodes) {
      if (
        node.parentId &&
        (node.data.kind === 'screen' ||
          nodes.get(node.parentId)?.data.kind !== 'screen')
      )
        context.addIssue({
          code: 'custom',
          message: 'Wireframe blocks must belong to a top-level screen',
        })
    }
    if (
      graph.edges.some(
        (e) =>
          !nodes.has(e.source) || !nodes.has(e.target) || e.source === e.target,
      )
    )
      context.addIssue({
        code: 'custom',
        message: 'Flows must connect two existing wireframe blocks',
      })
  })
export type Wireframe = z.infer<typeof wireframeSchema>
export type WireNode = Wireframe['nodes'][number]
export type WireKind = WireNode['data']['kind']
export const wireLabels: Record<WireKind, string> = {
  screen: 'Screen',
  text: 'Text',
  button: 'Button',
  input: 'Input',
  card: 'Card',
  image: 'Image',
  navigation: 'Navigation',
}
const sizes: Record<WireKind, [number, number]> = {
  screen: [640, 460],
  text: [260, 64],
  button: [168, 44],
  input: [260, 64],
  card: [260, 150],
  image: [240, 150],
  navigation: [560, 56],
}
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
export function wirePosition(node: WireNode, nodes: WireNode[]) {
  const parent = nodes.find((n) => n.id === node.parentId)
  return {
    x: node.position.x + (parent?.position.x || 0),
    y: node.position.y + (parent?.position.y || 0),
  }
}
export function removeWireNodes(
  graph: Wireframe,
  selected: Set<string>,
): Wireframe {
  const ids = new Set(selected)
  for (const node of graph.nodes)
    if (node.parentId && ids.has(node.parentId)) ids.add(node.id)
  return {
    nodes: graph.nodes.filter((n) => !ids.has(n.id)),
    edges: graph.edges.filter((e) => !ids.has(e.source) && !ids.has(e.target)),
  }
}
