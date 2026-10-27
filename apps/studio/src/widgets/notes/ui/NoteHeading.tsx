import { createElement } from 'react'
import type { ComponentProps } from 'react'
import type { ExtraProps } from 'react-markdown'
export function NoteHeading({
  node,
  children,
  ...props
}: ComponentProps<'h1'> & ExtraProps) {
  return createElement(
    node?.tagName || 'h2',
    { ...props, 'data-line': node?.position?.start.line },
    children,
  )
}
