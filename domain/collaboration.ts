import { z } from 'zod'
import { workspaceSchema, type Workspace } from './workspace.ts'

export type Json =
  null | boolean | number | string | Json[] | { [key: string]: Json }
export type Operation = { path: string[]; before?: Json; after?: Json }
export const operationsSchema = z
  .array(
    z.object({
      path: z
        .array(
          z
            .string()
            .min(1)
            .max(100)
            .refine(
              (s) => !['__proto__', 'constructor', 'prototype'].includes(s),
            ),
        )
        .min(1)
        .max(8),
      before: z.json().optional(),
      after: z.json().optional(),
    }),
  )
  .max(10000)
export type Profile = {
  id: string
  name: string
  avatar: string
  color: string
}
export type Presence = {
  clientId: string
  profile: Profile
  boardId: string | null
  view: string
  cursor: { x: number; y: number } | null
  selected: string[]
  selectedEdges?: string[]
  seenAt: number
  sequence?: number
  dragging?: DragPosition[]
  camera?: CameraPresence | null
  following?: string | null
  requirement?: RequirementPresence | null
}
export const requirementFieldSchema = z.enum([
  'title',
  'description',
  'acceptance',
  'priority',
  'status',
  'category',
])
export type RequirementField = z.infer<typeof requirementFieldSchema>
export type RequirementPresence = {
  id: string
  field: RequirementField | null
  typing: boolean
}
export type DragPosition = { id: string; position: { x: number; y: number } }
export type Activity = {
  id: number
  userId: string
  name: string
  message: string
  createdAt: string
}
export const cameraSchema = z.object({
  x: z.number().finite().min(-1e7).max(1e7),
  y: z.number().finite().min(-1e7).max(1e7),
  zoom: z.number().finite().min(0.1).max(2),
})
export type CameraPresence = z.infer<typeof cameraSchema>
export const presenceSchema = z.object({
  camera: cameraSchema.nullable().default(null),
  following: z.string().uuid().nullable().default(null),
  clientId: z.string().uuid(),
  boardId: z.string().max(100).nullable(),
  view: z.enum(['canvas', 'wireframes', 'requirements', 'design', 'notes']),
  cursor: z
    .object({
      x: z.number().finite().min(-1e7).max(1e7),
      y: z.number().finite().min(-1e7).max(1e7),
    })
    .nullable(),
  selected: z.array(z.string().max(100)).max(500),
  selectedEdges: z.array(z.string().min(1).max(100)).max(1500).default([]),
  requirement: z
    .object({
      id: z.string().min(1).max(100),
      field: requirementFieldSchema.nullable(),
      typing: z.boolean(),
    })
    .nullable()
    .default(null),
  sequence: z.number().int().nonnegative().safe().optional(),
  dragging: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        position: z.object({
          x: z.number().finite().min(-1e7).max(1e7),
          y: z.number().finite().min(-1e7).max(1e7),
        }),
      }),
    )
    .max(500)
    .default([]),
})

function indexed(items: { id: string }[]) {
  return Object.fromEntries(items.map((item) => [item.id, item]))
}
function documentOf(workspace: Workspace): Json {
  return JSON.parse(
    JSON.stringify({
      schemaVersion: 1,
      boards: Object.fromEntries(
        workspace.boards.map(
          ({
            viewport: _viewport,
            wireframeViewport: _wireframeViewport,
            ...board
          }) => [
            board.id,
            {
              ...board,
              nodes: indexed(board.nodes),
              edges: indexed(board.edges),
              wireframe: {
                nodes: indexed(board.wireframe?.nodes || []),
                edges: indexed(board.wireframe?.edges || []),
              },
            },
          ],
        ),
      ),
      requirements: indexed(workspace.requirements),
      notes: workspace.notes,
      design: workspace.design,
    }),
  ) as Json
}
function workspaceOf(document: Json): Workspace {
  const value = document as Record<string, Json>
  const boards = Object.values(value.boards as Record<string, Json>).map(
    (entry) => {
      const board = entry as Record<string, Json>
      return {
        ...board,
        nodes: Object.values(board.nodes as object),
        edges: Object.values(board.edges as object),
        wireframe: {
          nodes: Object.values(
            (board.wireframe as Record<string, Json> | undefined)?.nodes || {},
          ),
          edges: Object.values(
            (board.wireframe as Record<string, Json> | undefined)?.edges || {},
          ),
        },
      }
    },
  )
  return workspaceSchema.parse({
    ...value,
    boards,
    requirements: Object.values(value.requirements as object),
  })
}
export const equal = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b)
const object = (v: Json | undefined): v is Record<string, Json> =>
  v !== null && typeof v === 'object' && !Array.isArray(v)
export function diffWorkspace(
  before: Workspace,
  after: Workspace,
): Operation[] {
  const operations: Operation[] = []
  function visit(a: Json | undefined, b: Json | undefined, path: string[]) {
    if (equal(a, b)) return
    if (object(a) && object(b) && path.at(-1) !== 'position') {
      for (const key of new Set([...Object.keys(a), ...Object.keys(b)]))
        visit(a[key], b[key], [...path, key])
    } else operations.push({ path, before: a, after: b })
  }
  visit(documentOf(before), documentOf(after), [])
  return operations
}
export class MergeConflict extends Error {
  paths: string[]
  constructor(paths: string[]) {
    super(
      'Someone changed the same part of the workspace. Export your edits or reload the shared version.',
    )
    this.paths = paths
  }
}
export function applyOperations(
  workspace: Workspace,
  operations: Operation[],
  check = true,
): Workspace {
  const doc = documentOf(workspace)
  const conflicts: string[] = []
  for (const op of operationsSchema.parse(operations) as Operation[]) {
    if (!['boards', 'requirements', 'notes', 'design'].includes(op.path[0]))
      throw new Error('Unsupported change path')
    let parent = doc as Record<string, Json>
    let missing = false
    for (const part of op.path.slice(0, -1)) {
      if (!Object.hasOwn(parent, part) || !object(parent[part])) {
        missing = true
        break
      }
      parent = parent[part] as Record<string, Json>
    }
    const key = op.path.at(-1)!
    const current = missing ? undefined : parent[key]
    if (!missing && equal(current, op.after)) continue
    if (missing || (check && !equal(current, op.before))) {
      conflicts.push(op.path.join(' / '))
      continue
    }
    if (op.after === undefined) delete parent[key]
    else parent[key] = structuredClone(op.after)
  }
  if (conflicts.length) throw new MergeConflict(conflicts)
  return workspaceOf(doc)
}
export function describeOperations(operations: Operation[]): string {
  if (operations.some((o) => o.path[2] === 'wireframe')) {
    if (operations.every((o) => o.path.at(-1) === 'position'))
      return 'Moved wireframe blocks'
    return operations.some((o) => o.path[3] === 'edges')
      ? 'Updated wireframe flows'
      : 'Edited wireframe blocks'
  }
  const nodes = new Set(
    operations
      .filter((o) => o.path[2] === 'nodes')
      .map((o) => `${o.path[1]}/${o.path[3]}`),
  )
  if (nodes.size) {
    const moved = operations.every((o) => o.path.at(-1) === 'position')
    return `${moved ? 'Moved' : 'Edited'} ${nodes.size} node${nodes.size === 1 ? '' : 's'}`
  }
  if (operations.some((o) => o.path[2] === 'edges'))
    return 'Updated connections'
  if (operations.some((o) => o.path[0] === 'requirements'))
    return 'Updated requirements'
  if (operations.some((o) => o.path[0] === 'notes'))
    return 'Updated project notes'
  if (operations.some((o) => o.path[0] === 'design'))
    return 'Updated design direction'
  return 'Updated boards'
}
