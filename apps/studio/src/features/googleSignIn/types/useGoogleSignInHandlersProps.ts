export type GoogleSignInHandlersProps = {
  setError: (
    value:
      | import('../types').GoogleSignInState['error']
      | ((
          current: import('../types').GoogleSignInState['error'],
        ) => import('../types').GoogleSignInState['error']),
  ) => void
  setRetry: (
    value:
      | import('../types').GoogleSignInState['retry']
      | ((
          current: import('../types').GoogleSignInState['retry'],
        ) => import('../types').GoogleSignInState['retry']),
  ) => void
}
