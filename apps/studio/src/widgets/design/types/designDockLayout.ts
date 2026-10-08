import type { DesignDockRect } from './designDockRect.ts'
import type { DesignDockEdge } from './designDockEdge.ts'
export type DesignDockLayout = {
  insets: Record<DesignDockEdge, number>
  panels: Record<'left' | 'right', DesignDockRect>
  group: { edge: DesignDockEdge; rect: DesignDockRect } | null
}
