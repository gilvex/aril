import {
  Circle,
  Image,
  MousePointer2,
  RectangleHorizontal,
  Smartphone,
  TextCursorInput,
  Type,
  Group,
} from 'lucide-react'
export const designTools = [
  { kind: 'frame', label: 'Desktop frame', icon: RectangleHorizontal },
  { kind: 'frame', label: 'Mobile frame', icon: Smartphone, mobile: true },
  { kind: 'text', label: 'Text', icon: Type },
  { kind: 'rectangle', label: 'Rectangle', icon: RectangleHorizontal },
  { kind: 'ellipse', label: 'Ellipse', icon: Circle },
  { kind: 'button', label: 'Button', icon: MousePointer2 },
  { kind: 'image', label: 'Image', icon: Image },
] as const
export const designLayerIcons = {
  group: Group,
  frame: RectangleHorizontal,
  text: Type,
  rectangle: RectangleHorizontal,
  ellipse: Circle,
  button: TextCursorInput,
  image: Image,
}
