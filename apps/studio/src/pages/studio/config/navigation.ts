import { ListChecks, NotebookPen, Palette, Workflow } from 'lucide-react'

export const navigation = [
  { id: 'canvas' as const, name: 'Canvas', icon: Workflow },
  { id: 'requirements' as const, name: 'Requirements', icon: ListChecks },
  { id: 'design' as const, name: 'Design direction', icon: Palette },
  { id: 'notes' as const, name: 'Project notes', icon: NotebookPen },
]
