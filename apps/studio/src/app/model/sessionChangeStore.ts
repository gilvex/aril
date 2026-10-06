import { configureStore, createSlice } from '@reduxjs/toolkit'

const slice = createSlice({
  name: 'sessionChange',
  initialState: false,
  reducers: { changed: () => true },
})
export const sessionChangeStore = configureStore({
  reducer: slice.reducer,
  devTools: false,
})
export const sessionChanged = slice.actions.changed
