import type { DesignBoardState } from '../types/designBoardState.ts'
export function createDesignBoardState(): DesignBoardState {
  return {
    tab: 'Services',
    selected: [],
    device: 'desktop',
    theme: 'light',
    inspector: typeof window !== 'undefined' && window.innerWidth >= 1150,
    query: '',
    notice: '',
  }
}
