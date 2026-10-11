import type { Board } from '../types/board.ts'
/** Wireframes remain in saved documents, but new navigation uses Design. */
export function activeBoardSections(
  board: Pick<Board, 'sections'>,
): ('canvas' | 'design')[] {
  return [
    ...new Set(
      (board.sections || ['canvas', 'design']).map((section) =>
        section === 'wireframes' ? 'design' : section,
      ),
    ),
  ]
}
