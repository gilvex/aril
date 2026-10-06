import type { GoogleSignInState } from '@/features/googleSignIn/types/googleSignInState.ts'
import { createSelector } from '@reduxjs/toolkit'

export const selectGoogleSignIn = createSelector(
  [(state: GoogleSignInState) => state],
  (state) => ({ ...state }),
)
