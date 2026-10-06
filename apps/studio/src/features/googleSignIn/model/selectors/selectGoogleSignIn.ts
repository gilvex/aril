import { createSelector } from '@reduxjs/toolkit'
import type { GoogleSignInState } from '../../types/googleSignInState.ts'

export const selectGoogleSignIn = createSelector(
  [(state: GoogleSignInState) => state],
  (state) => ({ ...state }),
)
