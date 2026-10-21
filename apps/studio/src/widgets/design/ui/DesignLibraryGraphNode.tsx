import { Text } from '@/shared/ui/Text.tsx'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Component, Variable, Workflow, File } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignLibraryGraphNode as AssetNode } from '../types/designLibraryGraphNode.ts'
const icons = {
  component: Component,
  variable: Variable,
  machine: Workflow,
  page: File,
}
export function DesignLibraryGraphNode({ data }: NodeProps<AssetNode>) {
  const { t } = useTranslation()
  const Icon = icons[data.kind]
  return (
    <div className="library-graph-node" data-kind={data.kind}>
      <Handle type="target" position={Position.Left} />
      {data.icon ? (
        <Text as="span" className="library-custom-icon">
          {data.icon}
        </Text>
      ) : (
        <Icon size={18} />
      )}
      <Text as="strong">{data.label}</Text>
      <Text as="small">{t('{{count}} uses', { count: data.count })}</Text>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}
