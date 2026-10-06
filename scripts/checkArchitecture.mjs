import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const root = process.cwd()
const sourceRoots = [
  'apps/studio/src',
  'apps/studio/server',
  'packages/domain/src',
  'packages/mcp/src',
]
const layers = ['shared', 'entities', 'features', 'widgets', 'pages', 'app']
const browserStateExceptions = new Map([
  ['widgets/board/model/useBlueprintController.ts', new Set(['flow'])],
  ['widgets/board/model/useWireframeController.ts', new Set(['flow'])],
  ['widgets/board/model/useLiveNodePositions.ts', new Set(['positions'])],
  ['features/agentAccess/ui/AgentAccess.tsx', new Set(['secret'])],
])
const errors = []
let checked = 0
for (const sourceRoot of sourceRoots) {
  const absolute = path.resolve(root, sourceRoot)
  for (const relative of fs
    .readdirSync(absolute, { recursive: true })
    .filter((file) => /\.tsx?$/.test(file) && !file.endsWith('.test.ts'))) {
    const file = path.join(absolute, relative),
      portable = relative.replaceAll('\\', '/')
    const text = fs.readFileSync(file, 'utf8'),
      source = ts.createSourceFile(
        file,
        text,
        ts.ScriptTarget.Latest,
        true,
        file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      )
    checked++
    const report = (message) =>
      errors.push(`${sourceRoot}/${portable}: ${message}`)
    const base = path.basename(file).replace(/\.d\.ts$|\.tsx?$/, '')
    const isFrontend = sourceRoot === 'apps/studio/src'
    const component =
      isFrontend && portable.includes('/ui/') && base !== 'index'
    if (!(component ? /^[A-Z][A-Za-z0-9]*$/ : /^[a-z][A-Za-z0-9]*$/).test(base))
      report(
        component
          ? 'Use PascalCase component filenames.'
          : 'Use camelCase filenames.',
      )
    const functions = source.statements.flatMap((statement) =>
      ts.isFunctionDeclaration(statement)
        ? [statement]
        : ts.isVariableStatement(statement)
          ? statement.declarationList.declarations.filter(
              (declaration) =>
                declaration.initializer &&
                (ts.isArrowFunction(declaration.initializer) ||
                  ts.isFunctionExpression(declaration.initializer)),
            )
          : [],
    )
    const components = component
      ? source.statements.flatMap((statement) =>
          ts.isFunctionDeclaration(statement) &&
          statement.name &&
          /^[A-Z]/.test(statement.name.text)
            ? [statement]
            : ts.isVariableStatement(statement)
              ? statement.declarationList.declarations.filter(
                  (declaration) =>
                    ts.isIdentifier(declaration.name) &&
                    /^[A-Z]/.test(declaration.name.text),
                )
              : [],
        )
      : []
    if (components.length > 1)
      report('Keep one component per file, including memo/lazy components.')
    for (const declaration of components) {
      if (declaration.getText(source).split('\n').length > 125)
        report('Keep components at most 125 lines; extract a focused component or hook.')
    }
    if (
      isFrontend &&
      portable.includes('/types/') &&
      !fs.existsSync(path.join(path.dirname(file), 'index.ts'))
    )
      report('Add a types/index.ts barrel.')
    if (functions.length > 1)
      report(
        'Keep one top-level component or utility function per file; nested callbacks belong to their owner.',
      )
    if (
      portable.includes('/types/') &&
      source.statements.filter(
        (statement) =>
          ts.isTypeAliasDeclaration(statement) ||
          ts.isInterfaceDeclaration(statement),
      ).length > 1
    )
      report('Keep one type per file and re-export through types/index.ts.')
    if (
      base === 'index' &&
      !['apps/studio/server', 'packages/mcp/src'].includes(sourceRoot) &&
      source.statements.some((statement) => !ts.isExportDeclaration(statement))
    )
      report('index files are export-only public barrels.')
    if (isFrontend) {
      const parts = portable.split('/')
      const visit = (node) => {
        if (
          ts.isCallExpression(node) &&
          node.expression.getText(source) === 'useState'
        ) {
          const declaration = node.parent
          const field =
            ts.isVariableDeclaration(declaration) &&
            ts.isArrayBindingPattern(declaration.name)
              ? declaration.name.elements[0]?.name?.getText(source)
              : undefined
          if (!browserStateExceptions.get(portable)?.has(field))
            report(
              'Put application state in a named Redux slice, not useState.',
            )
        }
        if (ts.isJsxAttribute(node) && node.initializer && ts.isJsxExpression(node.initializer)) {
          const callback = node.initializer.expression
          if (callback && (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback)) && callback.getText(source).split('\n').length > 5)
            report('Move substantial JSX callbacks into a named useCallback handler or utility.')
        }
        const specifier =
          ts.isImportDeclaration(node) || ts.isExportDeclaration(node)
            ? node.moduleSpecifier
            : ts.isCallExpression(node) &&
                node.expression.kind === ts.SyntaxKind.ImportKeyword
              ? node.arguments[0]
              : undefined
        if (
          specifier &&
          ts.isStringLiteral(specifier) &&
          (specifier.text.startsWith('.') || specifier.text.startsWith('@/'))
        ) {
          const target = path
            .relative(
              absolute,
              specifier.text.startsWith('@/')
                ? path.resolve(absolute, specifier.text.slice(2))
                : path.resolve(path.dirname(file), specifier.text),
            )
            .replaceAll('\\', '/')
            .split('/')
          const from = layers.indexOf(parts[0]),
            to = layers.indexOf(target[0])
          if (to > from) report(`Upward import into ${target[0]} is forbidden.`)
          if (
            from === to &&
            !['shared', 'app'].includes(parts[0]) &&
            parts[1] !== target[1]
          )
            report(
              `Cross-slice import into ${target.slice(0, 2).join('/')} is forbidden.`,
            )
          if (
            ['entities', 'features', 'widgets', 'pages'].includes(target[0]) &&
            (parts[0] !== target[0] || parts[1] !== target[1]) &&
            !['', 'index.ts', 'index'].includes(target.slice(2).join('/'))
          )
            report(
              `Import another slice through its public index.ts: ${target.slice(0, 2).join('/')}.`,
            )
        }
        ts.forEachChild(node, visit)
      }
      visit(source)
    }
  }
}
if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else console.log(`Architecture checks passed (${checked} source files).`)
