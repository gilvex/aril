import { Text } from '@/shared/ui/Text.tsx'
import type { ComponentProps } from 'react'
import type { ExtraProps } from 'react-markdown'
export function NoteHeading({
  node,
  children,
  ...props
}: ComponentProps<'h1'> & ExtraProps) {
  return (
    <Text
      as={(node?.tagName || 'h2') as 'h1'}
      {...props}
      data-line={node?.position?.start.line}
    >
      {children}
    </Text>
  )
}
