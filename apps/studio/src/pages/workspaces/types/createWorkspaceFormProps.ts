export type CreateWorkspaceFormProps = {
  handleSubmit: (event: import('react').SubmitEvent<HTMLFormElement>) => void
  t: import('i18next').TFunction<'translation', undefined>
  name: string
  setName: (
    value:
      | import('../types/workspaceHomeState.ts').WorkspaceHomeState['name']
      | ((
          current: import('../types/workspaceHomeState.ts').WorkspaceHomeState['name'],
        ) => import('../types/workspaceHomeState.ts').WorkspaceHomeState['name']),
  ) => void
  setCreating: (
    value:
      | import('../types/workspaceHomeState.ts').WorkspaceHomeState['creating']
      | ((
          current: import('../types/workspaceHomeState.ts').WorkspaceHomeState['creating'],
        ) => import('../types/workspaceHomeState.ts').WorkspaceHomeState['creating']),
  ) => void
  busy: boolean
}
