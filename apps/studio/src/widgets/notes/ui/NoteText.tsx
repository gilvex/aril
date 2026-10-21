import { Text } from '@/shared/ui/Text.tsx'
import type { JSX } from 'react'
import type { NoteTextProps } from '../types/noteTextProps.ts'
export function NoteText({ node, children, ...props }: NoteTextProps) {
  return (
    <Text
      as={(node?.tagName || 'span') as keyof JSX.IntrinsicElements}
      {...props}
    >
      {children}
    </Text>
  )
}
