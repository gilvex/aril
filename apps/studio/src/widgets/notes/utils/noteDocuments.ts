import type { Workspace } from '@pomegranate/domain/workspace'
export function noteDocuments(workspace: Workspace, defaultTitle: string) {
  return [
    {
      id: 'project-notes',
      title: workspace.notesTitle || defaultTitle,
      body: workspace.notes,
    },
    ...(workspace.documents || []),
  ]
}
