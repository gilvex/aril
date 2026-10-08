import type { Requirement } from './requirement.ts'
export type RequirementLink = NonNullable<Requirement['links']>[number]
