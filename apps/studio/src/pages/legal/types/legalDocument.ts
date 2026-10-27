import type { LegalSection } from './legalSection.ts'

export type LegalDocument = {
  slug: string
  title: string
  summary: string
  sections: LegalSection[]
}
