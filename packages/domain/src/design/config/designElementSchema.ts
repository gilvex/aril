import { z } from 'zod'

export const designElementSchema = z.object({
  bindings: z
    .object({
      fill: z.string().max(100).optional(),
      stroke: z.string().max(100).optional(),
      color: z.string().max(100).optional(),
      width: z.string().max(100).optional(),
      height: z.string().max(100).optional(),
      radius: z.string().max(100).optional(),
      fontSize: z.string().max(100).optional(),
      text: z.string().max(100).optional(),
      hidden: z.string().max(100).optional(),
    })
    .optional(),
  instance: z
    .object({
      componentId: z.string().min(1).max(100),
      variantId: z.string().min(1).max(100),
      instanceId: z.string().min(1).max(60),
      sourceId: z.string().min(1).max(100),
      overrides: z
        .array(
          z.enum([
            'name',
            'x',
            'y',
            'width',
            'height',
            'order',
            'parentId',
            'fill',
            'stroke',
            'strokeWidth',
            'radius',
            'text',
            'color',
            'fontSize',
            'fontFamily',
            'fontWeight',
            'textAlign',
            'imageUrl',
            'hidden',
            'locked',
            'bindings',
          ]),
        )
        .max(24),
    })
    .optional(),
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
