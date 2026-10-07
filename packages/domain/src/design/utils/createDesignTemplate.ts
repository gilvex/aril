import { makeDesignElement } from './makeDesignElement.ts'
import type { DesignElement } from '../types/designElement.ts'
import type { Workspace } from '../../workspace/types/workspace.ts'

export function createDesignTemplate(
  design: Workspace['design'],
  t: (key: string) => string,
  x = 0,
  makeId: () => string = () => crypto.randomUUID(),
) {
  const nodes: DesignElement[] = []
  const add = (
    kind: DesignElement['kind'],
    name: string,
    props: Partial<DesignElement>,
  ) => {
    const node = makeDesignElement(kind, makeId(), {
      name: t(name),
      order: nodes.length,
      fontFamily: design.bodyFont || 'DM Sans',
      ...props,
    })
    nodes.push(node)
    return node.id
  }
  for (const mobile of [false, true]) {
    const width = mobile ? 390 : 1000
    const frame = add('frame', mobile ? 'Mobile' : 'Desktop', {
      x: x + (mobile ? 1120 : 0),
      width,
      height: 740,
      fill: '#f7f6f9',
    })
    const block = (
      kind: DesignElement['kind'],
      name: string,
      props: Partial<DesignElement>,
    ) => add(kind, name, { parentId: frame, ...props })
    block('rectangle', 'Header', {
      width,
      height: 72,
      fill: '#ffffff',
      strokeWidth: 1,
    })
    block('text', 'Brand', {
      x: 28,
      y: 22,
      width: 120,
      height: 36,
      text: 'aril',
      fontFamily: 'Manrope',
      fontSize: 25,
      fontWeight: '800',
      color: design.accent,
    })
    block('ellipse', 'Profile', {
      x: width - 62,
      y: 20,
      width: 32,
      height: 32,
      fill: '#eadce5',
    })
    block('text', 'Workspace', {
      x: 28,
      y: 100,
      width: 300,
      height: 24,
      text: t('My workspace'),
      fontSize: 13,
      color: '#796f82',
    })
    block('text', 'Title', {
      x: 28,
      y: 142,
      width: mobile ? 334 : 380,
      height: 50,
      text: t('Weekend servers'),
      fontFamily: design.headingFont || 'Manrope',
      fontWeight: '700',
      fontSize: mobile ? 27 : 34,
    })
    block('button', 'Primary action', {
      x: mobile ? 28 : 812,
      y: mobile ? 204 : 148,
      width: 160,
      height: 44,
      text: t('Create server'),
      fill: design.accent,
      fontWeight: '600',
    })
    if (!mobile) {
      block('rectangle', 'Search field', {
        x: 28,
        y: 222,
        width: 600,
        height: 44,
        fill: '#ffffff',
        strokeWidth: 1,
        radius: 8,
      })
      block('text', 'Search label', {
        x: 42,
        y: 234,
        width: 400,
        height: 22,
        text: t('Search servers…'),
        fontSize: 14,
        color: '#796f82',
      })
    }
    const rowHeight = design.density === 'Compact' ? 90 : 108
    for (let i = 0; i < 3; i++) {
      const y = (mobile ? 280 : 292) + i * (rowHeight + 16)
      block('rectangle', 'Server card', {
        x: 28,
        y,
        width: width - 56,
        height: rowHeight,
        fill: '#ffffff',
        radius: 12,
        strokeWidth: 1,
      })
      block('rectangle', 'Server icon', {
        x: 44,
        y: y + 22,
        width: 42,
        height: 42,
        fill: '#f2e5ec',
        radius: 10,
      })
      block('text', 'Server name', {
        x: 104,
        y: y + 23,
        width: mobile ? 220 : 430,
        height: 26,
        text: ['Survival · EU West', 'Creative · Friends', 'Modded · Test'][i],
        fontSize: 16,
        fontWeight: '600',
      })
      block('text', 'Server details', {
        x: 104,
        y: y + 52,
        width: mobile ? 215 : 420,
        height: 24,
        text: [
          'Minecraft 1.21 · 8 GB',
          'Minecraft 1.21 · 4 GB',
          'Fabric · 6 GB',
        ][i],
        fontSize: 12,
        color: '#796f82',
      })
      if (!mobile)
        block('button', 'Server status', {
          x: width - 144,
          y: y + 30,
          width: 92,
          height: 32,
          text: t(i === 2 ? 'Stopped' : 'Running'),
          fill: i === 2 ? '#efedf2' : '#e7f3ed',
          color: i === 2 ? '#796f82' : '#307568',
          radius: 16,
          fontSize: 12,
        })
    }
  }
  return nodes
}
