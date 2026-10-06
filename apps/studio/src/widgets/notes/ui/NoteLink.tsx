import type { ComponentProps } from 'react'
export function NoteLink({ children, href, title }: ComponentProps<'a'>) {
  return (
    <a href={href} title={title} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}
