import type { WireKind } from '../types/wireKind.ts'
export const sizes: Record<WireKind, [number, number]> = {
  screen: [640, 460],
  text: [260, 64],
  button: [168, 44],
  input: [260, 64],
  card: [260, 150],
  image: [240, 150],
  navigation: [560, 56],
}
