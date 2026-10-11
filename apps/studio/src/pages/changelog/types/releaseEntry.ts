export type ReleaseEntry = {
  id: string
  date: string
  title: string
  summary: string
  changes: string[]
  image: string
  imageAlt: string
  commit?: string
}
