import { type Operation } from '../../collaboration/index.ts'

export const canRebaseOperations = (operations: Operation[]) =>
  operations.every((op) => op.after !== undefined)
