export type GoogleApi = {
  accounts: {
    id: {
      disableAutoSelect?: () => void
      initialize: (options: {
        client_id: string
        nonce: string
        callback: (response: { credential: string }) => void
        auto_select: boolean
      }) => void
      renderButton: (
        element: HTMLElement,
        options: {
          theme: string
          size: string
          text: string
          type?: string
          shape?: string
          logo_alignment?: 'left' | 'center'
          width?: string
          locale?: string
        },
      ) => void
    }
  }
}
