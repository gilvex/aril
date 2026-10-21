import { configureStore } from '@reduxjs/toolkit'
import { iconPickerSlice } from './slices/iconPickerSlice.ts'
export function createIconPickerModel() {
  const store = configureStore({
    reducer: iconPickerSlice.reducer,
    devTools: false,
    middleware: (defaults) => defaults({ thunk: false }),
  })
  return {
    store,
    actions: {
      setOpen: (value: boolean) => {
        store.dispatch(iconPickerSlice.actions.setOpen(value))
      },
      setQuery: (value: string) => {
        store.dispatch(iconPickerSlice.actions.setQuery(value))
      },
      setSize: (value: number) => {
        store.dispatch(iconPickerSlice.actions.setSize(value))
      },
    },
  }
}
