import { readNoteText } from '../../noteText/utils/readNoteText.ts'
import { noteTextStateSchema } from '../../noteText/config/noteTextStateSchema.ts'
import { z } from 'zod'
import { strokesSchema } from '../../drawing/index.ts'
import { designSchema } from '../../design/index.ts'
import { wireframeSchema } from '../../wireframe/index.ts'
import { edge } from './edge.ts'
import { node } from './node.ts'
import { requirementSchema } from './requirementSchema.ts'
import { noteCommentSchema } from './noteCommentSchema.ts'
export const workspaceSchema = z
  .object({
    schemaVersion: z.literal(1),
    boards: z
      .array(
        z
          .object({
            id: z.string().min(1).max(100),
            name: z.string().min(1).max(100),
            description: z.string().max(1000),
            strokes: strokesSchema.optional(),
            nodes: z.array(node).max(500),
            edges: z.array(edge).max(1500),
            sections: z
              .array(z.enum(['canvas', 'wireframes', 'design']))
              .min(1)
              .max(3)
              .refine((values) => new Set(values).size === values.length)
              .optional(),
            design: designSchema.optional(),
            wireframe: wireframeSchema.optional(),
            wireframeViewport: z
              .object({
                x: z.number().finite(),
                y: z.number().finite(),
                zoom: z.number().min(0.1).max(3),
              })
              .optional(),
            viewport: z
              .object({
                x: z.number().finite(),
                y: z.number().finite(),
                zoom: z.number().min(0.1).max(3),
              })
              .optional(),
          })
          .superRefine((board, context) => {
            const ids = new Set(board.nodes.map((n) => n.id))
            if (ids.size !== board.nodes.length)
              context.addIssue({
                code: 'custom',
                message: 'Duplicate node IDs',
              })
            if (
              new Set(board.edges.map((e) => e.id)).size !== board.edges.length
            )
              context.addIssue({
                code: 'custom',
                message: 'Duplicate edge IDs',
              })
            if (
              board.edges.some((e) => !ids.has(e.source) || !ids.has(e.target))
            )
              context.addIssue({
                code: 'custom',
                message: 'Connections must reference existing nodes',
              })
          }),
      )
      .min(1)
      .max(50),
    requirements: z.array(requirementSchema).max(500),
    noteComments: z.array(noteCommentSchema).max(1000).optional(),
    noteStates: z
      .record(z.string().min(1).max(90), noteTextStateSchema)
      .refine((value) => Object.keys(value).length <= 51)
      .optional(),
    notes: z.string().max(50000),
    notesTitle: z.string().min(1).max(120).optional(),
    documents: z
      .array(
        z.object({
          id: z
            .string()
            .min(1)
            .max(90)
            .refine((id) => id !== 'project-notes'),
          title: z.string().min(1).max(120),
          body: z.string().max(50000),
        }),
      )
      .max(50)
      .optional(),
    design: designSchema,
  })
  .superRefine((workspace, context) => {
    for (const state of Object.values(workspace.noteStates || {})) {
      try {
        readNoteText(state)
      } catch {
        context.addIssue({
          code: 'custom',
          message: 'Invalid collaborative note state',
        })
        break
      }
    }
    if (
      new Set(workspace.documents?.map((d) => d.id)).size !==
      (workspace.documents?.length || 0)
    )
      context.addIssue({ code: 'custom', message: 'Duplicate document IDs' })
    if (
      new Set(workspace.boards.map((b) => b.id)).size !==
      workspace.boards.length
    )
      context.addIssue({ code: 'custom', message: 'Duplicate board IDs' })
    if (
      new Set(workspace.noteComments?.map((c) => c.id)).size !==
      (workspace.noteComments?.length || 0)
    )
      context.addIssue({
        code: 'custom',
        message: 'Duplicate note comment IDs',
      })
    const requirements = new Set(workspace.requirements.map((r) => r.id))
    if (requirements.size !== workspace.requirements.length)
      context.addIssue({ code: 'custom', message: 'Duplicate requirement IDs' })
    if (
      workspace.boards.some((b) =>
        b.nodes.some((n) =>
          n.data.requirements.some((id) => !requirements.has(id)),
        ),
      )
    )
      context.addIssue({
        code: 'custom',
        message: 'Unknown linked requirement',
      })
  })
