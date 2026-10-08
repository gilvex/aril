import { createSeed } from '@pomegranate/domain/seed'
import { workspaceSchema } from '@pomegranate/domain/workspace'
import { createDemoWireframe } from './createDemoWireframe.ts'
import { withDemoDesign } from './withDemoDesign.ts'

export function createDemoWorkspace() {
  const workspace = createSeed()
  workspace.boards[0].wireframe = createDemoWireframe()
  for (const [index, requirement] of workspace.requirements.entries()) {
    requirement.decision = (['Agreed', 'Proposed', 'Deferred'] as const)[
      index % 3
    ]
    requirement.workspaceWide = requirement.id === 'R14'
    if (requirement.id === 'R13') {
      requirement.decision = 'Agreed'
      requirement.questions = [
        {
          id: 'demo-game-updates',
          text: 'How do existing servers adopt a new game version?',
          resolved: false,
        },
      ]
      requirement.links = [
        { kind: 'wireframes', boardId: workspace.boards[0].id },
      ]
    }
    requirement.status = (['Ready', 'Designing', 'Captured'] as const)[
      index % 3
    ]
    requirement.priority = (
      ['Must have', 'Must have', 'Should have', 'Later'] as const
    )[index % 4]
  }
  for (const board of workspace.boards) {
    board.nodes.forEach((node, index) => {
      node.data.status = (['Decided', 'Exploring', 'Question'] as const)[
        index % 3
      ]
    })
  }
  workspace.notesTitle = 'Start here'
  workspace.notes =
    '# Welcome to the Aril demo\n\nThis is your private, editable sandbox. Changes stay in this tab; no account or live workspace is involved. Use **Reset demo** to start again.\n\n## Explore the project\n- **Blueprint:** select or double-click a node, edit its details, drag multiple nodes, connect handles, or open the linked requirements.\n- **Wireframes:** follow the six-screen recipe flow. Switch to Preview flow and click the buttons.\n- **Scope:** explore board-linked outcomes, decisions, open questions, acceptance criteria and connected visual work.\n- **Design:** explore the editable desktop and mobile server dashboard. Double-click text to edit, drag or resize layers, inspect frame children, and try colors, typography, duplicate, hide, lock and undo.\n- **Notes:** add a document, edit Markdown, and use the outline or split view.\n\n## Collaboration preview\nMaya reviews the blueprint, Noah works on wireframes, Iris reviews requirements, and Leo writes notes. These are simulated teammates with independent tasks. Their cursors, selections and cameras demonstrate presence and following. They perform a short sequence of real edits in this sandbox: dragging blocks, refining labels, advancing requirements, and updating notes. They skip items you select or change. Maya finishes small planning tasks: a related idea, its connection, a single alignment, and a decision. She works in a bounded row, keeps three ideas visible at most, varies topics and gesture order, and retires older completed ideas. She pauses between deliberate gestures and avoids occupied space. Edit or connect one of her ideas to keep it. Open People and follow one, or inspect Team activity.\n\n## Make it yours\nRename an idea, move a requirement, then try Undo, Redo, history and JSON export. Your saved demo changes survive refresh in this tab. Closing the tab ends this sandbox.\n'
  workspace.documents = [
    {
      id: 'recipe-decisions',
      title: 'Recipe decisions',
      body: '# Reusable game recipes\n\n## Decision\nSeparate the **runtime image**, **versioned game layer**, and **server blueprint**. Every instance receives its own writable world volume.\n\n## Why\nOne build should power several independently configured servers without repeating installation.\n\n| Layer | Contains | Changes when |\n| --- | --- | --- |\n| Runtime | Java + OS dependencies | Runtime patch |\n| Game | Verified game binaries | Game version |\n| Blueprint | Startup + environment schema | Configuration contract |\n\n## Acceptance\n- [x] Pin immutable artifacts\n- [x] Describe required variables\n- [ ] Validate host port conflicts\n\nSee R13 in Scope and the Deployment blueprint board.',
    },
    {
      id: 'release-plan',
      title: 'First release checklist',
      body: '# First release\n\n## Plan\n1. Review the deployment blueprint.\n2. Walk through the recipe wireframes.\n3. Confirm acceptance criteria for the Must have requirements.\n4. Compare desktop and mobile designs.\n\n## Questions\n- Which game ships first?\n- How long should installation logs be retained?\n- How do operators recover a failed batch?\n\n> This is sample planning content, not a working deployment service.',
    },
  ]
  workspace.design.headingFont = 'Manrope'
  workspace.design.bodyFont = 'DM Sans'
  return workspaceSchema.parse(withDemoDesign(workspace))
}
