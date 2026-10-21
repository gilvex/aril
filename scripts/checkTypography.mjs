import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'
const errors = []
const tags = new Set([
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'strong',
  'small',
  'em',
  'code',
  'kbd',
  'label',
  'legend',
  'figcaption',
  'dt',
  'dd',
  'summary',
])
let components = 0
function inspect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name)
    if (entry.isDirectory()) {
      inspect(file)
      continue
    }
    const source = readFileSync(file, 'utf8')
    if (file.endsWith('.css') && /font-size:\s*(?:9|10|11)px\b/.test(source))
      errors.push(
        file + ': use the shared caption token instead of text below 12px',
      )
    if (!file.endsWith('.tsx') || entry.name === 'Text.tsx') continue
    const ast = ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    )
    const visit = (node) => {
      if (
        ts.isJsxElement(node) &&
        tags.has(node.openingElement.tagName.getText(ast))
      )
        errors.push(
          file +
            ':' +
            (ast.getLineAndCharacterOfPosition(node.getStart()).line + 1) +
            ': render semantic text through Text',
        )
      ts.forEachChild(node, visit)
    }
    visit(ast)
    if (/import.*\bText\b/.test(source)) components++
  }
}
inspect('apps/studio/src')
if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else
  console.log('Typography checks passed (' + components + ' files use Text).')
