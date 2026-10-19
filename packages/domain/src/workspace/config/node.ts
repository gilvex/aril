import { normalizeLegacyNodeData } from '../utils/normalizeLegacyNodeData.ts'
import { z } from 'zod'
import { nodeKinds } from './nodeKinds.ts'
import { position } from './position.ts'
import { statuses } from './statuses.ts'
export const node = z.object({
  id: z.string().min(1).max(100),
  type: z.literal('idea'),
  position,
  data: z.preprocess(
    normalizeLegacyNodeData,
    z.object({
      title: z.string().max(120),
      description: z.string().max(2000),
      kind: z.enum(nodeKinds),
      status: z.enum(statuses),
      notes: z.string().max(12000),
      icon: z
        .enum([
          'box',
          'device',
          'server',
          'router',
          'switch',
          'firewall',
          'wifi',
          'network',
          'internet',
          'cloud',
          'storage',
          'printer',
          'phone',
          'camera',
          'user',
        ])
        .optional(),
      network: z
        .object({
          address: z.string().max(255).optional(),
          hostname: z.string().max(255).optional(),
          mac: z.string().max(100).optional(),
          vlan: z.string().max(100).optional(),
          model: z.string().max(255).optional(),
          location: z.string().max(255).optional(),
        })
        .optional(),
      requirements: z.array(z.string()).max(50),
    }),
  ),
})
