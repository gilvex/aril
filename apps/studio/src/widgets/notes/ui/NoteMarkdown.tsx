import Markdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { NoteHeading } from './NoteHeading.tsx'
import { NoteLink } from './NoteLink.tsx'
const components: Components = {
  a: NoteLink,
  h1: NoteHeading,
  h2: NoteHeading,
  h3: NoteHeading,
  h4: NoteHeading,
  h5: NoteHeading,
  h6: NoteHeading,
}
export function NoteMarkdown({ body }: { body: string }) {
  return (
    <Markdown remarkPlugins={[remarkGfm]} components={components} skipHtml>
      {body}
    </Markdown>
  )
}
