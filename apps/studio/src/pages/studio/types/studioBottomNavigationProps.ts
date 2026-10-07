import type { StudioView as View } from '@/shared/types/studioView.ts'

export type StudioBottomNavigationProps = {
  view: View
  setView: (
    value:
      | import('../types/studioState.ts').StudioState['view']
      | ((
          current: import('../types/studioState.ts').StudioState['view'],
        ) => import('../types/studioState.ts').StudioState['view']),
  ) => void
  setSidebarOpen: (
    value:
      | import('../types/studioState.ts').StudioState['sidebarOpen']
      | ((
          current: import('../types/studioState.ts').StudioState['sidebarOpen'],
        ) => import('../types/studioState.ts').StudioState['sidebarOpen']),
  ) => void
  present: (
    | import('@pomegranate/domain/collaboration').Presence
    | {
        profile: import('@pomegranate/domain/collaboration').Profile
        view:
          | 'canvas'
          | 'requirements'
          | 'design'
          | 'notes'
          | 'wireframes'
          | 'settings'
        boardId: string | null
      }
  )[]
  mobileMenuToggle: import('react').RefObject<HTMLButtonElement | null>
  sidebarOpen: boolean
}
