export type WireframeBlockHandlersProps = {
  data: {
    kind:
      'screen' | 'text' | 'button' | 'input' | 'card' | 'image' | 'navigation'
    title: string
    content: string
    tone: 'plain' | 'soft' | 'accent'
  } & {
    preview: boolean
    checkpoint: () => void
    follow?: () => void
    selectorColor?: string
  }
}
