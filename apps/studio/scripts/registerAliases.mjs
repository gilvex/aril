import { registerHooks } from 'node:module'
import { existsSync, statSync } from 'node:fs'

// Node's native TypeScript test runner does not read tsconfig paths.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      const target = new URL(`../src/${specifier.slice(2)}`, import.meta.url)
      for (const suffix of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
        const candidate = new URL(target.href + suffix)
        if (existsSync(candidate) && statSync(candidate).isFile())
          return nextResolve(candidate.href, context)
      }
      return nextResolve(target.href, context)
    }
    return nextResolve(specifier, context)
  },
})
