import type { DesignElement } from '../types/designElement.ts'

export function makeDesignElement(
  kind: DesignElement['kind'],
  id: string,
  overrides: Partial<DesignElement> = {},
): DesignElement {
  return {
    id,
    kind,
    name: kind,
    order: 0,
    x: 0,
    y: 0,
    width: kind === 'frame' ? 1000 : kind === 'text' ? 280 : 180,
    height:
      kind === 'frame'
        ? 720
        : kind === 'text'
          ? 56
          : kind === 'button'
            ? 44
            : 120,
    fill:
      kind === 'frame'
        ? '#ffffff'
        : kind === 'text'
          ? 'transparent'
          : kind === 'button'
            ? '#b34568'
            : '#ede9f1',
    stroke: '#ded8e5',
    strokeWidth: kind === 'frame' ? 1 : 0,
    radius: kind === 'button' ? 8 : 0,
    text: '',
    color: kind === 'button' ? '#ffffff' : '#302b3b',
    fontSize: kind === 'text' ? 24 : 14,
    fontFamily: 'DM Sans',
    fontWeight: '400',
    textAlign: kind === 'button' ? 'center' : 'left',
    imageUrl: '',
    ...overrides,
  }
}
