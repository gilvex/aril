export type LegalSection = {
  id: string
  title: string
  paragraphs: string[]
  links?: { label: string; href: string }[]
}
