import { z } from 'zod'

export const designElementSchema = z.object({
  id: z.string().min(1).max(100),
  kind: z.enum([
    'frame',
    'group',
    'rectangle',
    'ellipse',
    'text',
    'button',
    'image',
  ]),
  maskId: z.string().min(1).max(100).optional(),
  clipContent: z.boolean().optional(),
  name: z.string().min(1).max(120),
  order: z.number().int().min(0).max(100000),
  parentId: z.string().min(1).max(100).optional(),
  x: z.number().finite().min(-1e6).max(1e6),
  y: z.number().finite().min(-1e6).max(1e6),
  width: z.number().finite().min(16).max(6000),
  height: z.number().finite().min(16).max(6000),
  fill: z.string().regex(/^(#[0-9a-fA-F]{6}|transparent)$/),
  stroke: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  strokeWidth: z.number().min(0).max(20),
  radius: z.number().min(0).max(1000),
  text: z.string().max(12000),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  fontSize: z.number().min(8).max(200),
  fontFamily: z.enum(['Manrope', 'DM Sans', 'System', 'Georgia']),
  fontWeight: z.enum(['400', '500', '600', '700', '800']),
  textAlign: z.enum(['left', 'center', 'right']),
  imageUrl: z
    .string()
    .max(2000)
    .refine((value) => !value || /^https:\/\//i.test(value)),
  hidden: z.boolean().optional(),
  locked: z.boolean().optional(),
})
