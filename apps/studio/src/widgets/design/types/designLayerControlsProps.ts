import type { EditorMenuAction } from '@/shared/types/index.ts'
import type { DesignLayerRowProps } from './designLayerRowProps.ts'
export type DesignLayerControlsProps = Pick<
  DesignLayerRowProps,
  'model' | 'node'
> & { actions: EditorMenuAction[] }
