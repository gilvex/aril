import type { WireKind } from '../types/wireKind.ts'
export const wireLabels: Record<WireKind, string> = {
  screen: 'Screen',
  text: 'Text',
  button: 'Button',
  input: 'Input',
  card: 'Card',
  image: 'Image',
  navigation: 'Navigation',
}
