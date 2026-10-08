import { configureStore } from '@reduxjs/toolkit'
import { accentSlice } from './slices/accentSlice.ts'
export const accentStore = configureStore({ reducer: accentSlice.reducer })
