import {
  configureStore,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import type { ControlMarker } from '../types/controlMarker.ts'
export function createControlPresenceStore() {
  const slice = createSlice({
    name: 'controlPresence',
    initialState: [] as ControlMarker[],
    reducers: {
      rendered: (_state, action: PayloadAction<ControlMarker[]>) =>
        action.payload,
    },
  })
  const store = configureStore({ reducer: slice.reducer, devTools: false })
  return {
    ...store,
    render: (markers: ControlMarker[]) =>
      store.dispatch(slice.actions.rendered(markers)),
  }
}
