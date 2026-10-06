export class MergeConflict extends Error {
  paths: string[]
  constructor(paths: string[]) {
    super(
      'Someone changed the same part of the workspace. Export your edits or reload the shared version.',
    )
    this.paths = paths
  }
}
