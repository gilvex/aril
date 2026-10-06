import type { DemoState } from '../types/demoState.ts'
import { sampleDemoCurve } from './sampleDemoCurve.ts'

export function sampleDemoPlannerPresence(state: DemoState, now: number) {
  const planner = state.planner
  const action = planner.action
  if (!state.envelope.workspace.boards.some((board) => board.id === 'layers'))
    return { cursor: null, camera: null, selected: [], dragging: [] }
  if (!action?.motion || !action.focus)
    return {
      cursor: planner.cursor,
      camera: planner.camera,
      selected: planner.selected,
      dragging: [],
    }
  const elapsed = now - Date.parse(state.studio.createdAt) - action.at
  const motion = action.motion
  const approach = Math.max(0, Math.min(1, elapsed / motion.approach))
  const work = Math.max(
    0,
    Math.min(1, (elapsed - motion.approach) / motion.work),
  )
  const position = action.drag
    ? sampleDemoCurve(action.drag.from, action.drag.to, work)
    : null
  const grip = { x: action.focus.x + 70, y: action.focus.y + 25 }
  const cursor =
    approach < 1
      ? sampleDemoCurve(motion.origin, grip, approach)
      : position && action.drag
        ? {
            x: grip.x + position.x - action.drag.from.x,
            y: grip.y + position.y - action.drag.from.y,
          }
        : grip
  const cameraProgress = Math.max(
    0,
    Math.min(1, elapsed / (motion.approach + motion.work)),
  )
  const camera = {
    ...sampleDemoCurve(
      motion.camera,
      motion.destinationCamera,
      cameraProgress,
      0.2,
    ),
    zoom: Math.exp(
      sampleDemoCurve(
        { x: Math.log(motion.camera.zoom), y: 0 },
        { x: Math.log(motion.destinationCamera.zoom), y: 0 },
        cameraProgress,
        0,
      ).x,
    ),
  }
  return {
    cursor,
    camera,
    selected: approach >= 1 ? [action.targetId] : planner.selected,
    dragging:
      position && approach >= 1 ? [{ id: action.targetId, position }] : [],
  }
}
