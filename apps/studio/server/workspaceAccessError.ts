export class WorkspaceAccessError extends Error {
  status = 403
  constructor() {
    super('You no longer have permission to edit this workspace.')
  }
}
