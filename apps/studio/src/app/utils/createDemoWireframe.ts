import type { Wireframe, WireNode } from '@pomegranate/domain/wireframe'

export function createDemoWireframe(): Wireframe {
  const nodes: WireNode[] = []
  const screens = [
    [
      'fleet',
      'Servers',
      0,
      0,
      'Your servers',
      'Survival EU · Running\nCreative EU · Running\nSurvival US · Updating',
      'Create recipe',
    ],
    [
      'runtime',
      '1 · Runtime image',
      560,
      0,
      'Choose a runtime',
      'eclipse-temurin:21-jre\nPinned image digest\nJava 21 · Linux x64',
      'Build runtime',
    ],
    [
      'game',
      '2 · Versioned game layer',
      1120,
      0,
      'Install the game once',
      'Paper 1.21 · Build 128\nInstall script: download + verify checksum\nImmutable game files · no world data',
      'Build game layer',
    ],
    [
      'blueprint',
      '3 · Server blueprint',
      1120,
      660,
      'Define reusable settings',
      'java -Xmx4G -jar server.jar nogui\n/data → isolated world volume\nGAME_PORT · MAX_PLAYERS · SERVER_NAME',
      'Publish blueprint',
    ],
    [
      'launch',
      '4 · Configure instances',
      560,
      660,
      'One recipe, many servers',
      'Survival EU · 25565 · 20 players\nCreative EU · 25566 · 40 players\nSurvival US · 25565 · 20 players',
      'Review & deploy',
    ],
    [
      'detail',
      '5 · Server detail',
      0,
      660,
      'Survival EU',
      'Running · 2 vCPU · 4 GB RAM\nConsole · Files · Networking · History\nDeployment complete. World volume ready.',
      'Back to servers',
    ],
  ] as const
  for (const [id, title, x, y, heading, content, action] of screens) {
    const add = (
      suffix: string,
      kind: WireNode['data']['kind'],
      name: string,
      body: string,
      px: number,
      py: number,
      width: number,
      height: number,
      tone: WireNode['data']['tone'] = 'plain',
    ) => {
      nodes.push({
        id: `${id}-${suffix}`,
        type: 'wireframe',
        position: { x: px, y: py },
        width,
        height,
        parentId: `${id}-screen`,
        data: { kind, title: name, content: body, tone },
      })
    }
    nodes.push({
      id: `${id}-screen`,
      type: 'wireframe',
      position: { x, y },
      width: 440,
      height: 540,
      data: { kind: 'screen', title, content: '', tone: 'plain' },
    })
    add(
      'nav',
      'navigation',
      'Aril · Game hosting',
      'Servers  /  Recipes  /  Activity',
      24,
      24,
      392,
      48,
      'soft',
    )
    add(
      'heading',
      'text',
      heading,
      'Example product screen · editable wireframe',
      24,
      96,
      392,
      64,
    )
    add(
      'content',
      'card',
      id === 'fleet' ? 'Server fleet' : 'Configuration',
      content,
      24,
      184,
      392,
      144,
      'soft',
    )
    add(
      'input',
      'input',
      id === 'blueprint' ? 'Environment variable' : 'Project',
      id === 'blueprint' ? 'SERVER_NAME=survival-eu' : 'Weekend worlds',
      24,
      352,
      392,
      56,
    )
    add('next', 'button', action, '', 24, 448, 392, 48, 'accent')
  }
  return {
    nodes,
    edges: screens.map(([id, , , , , , action], index) => ({
      id: `flow-${id}`,
      source: `${id}-next`,
      target: `${screens[(index + 1) % screens.length][0]}-screen`,
      label: action,
      type: 'smoothstep' as const,
    })),
  }
}
