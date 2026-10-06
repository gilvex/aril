export type StudioSummary = {
  id: string
  name: string
  createdAt: string
  role: 'owner' | 'member' | 'guest'
}
