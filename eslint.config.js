import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      '.pnpm-store',
      '.agents',
      '.pomegranate-scaffold',
      'artifacts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
)
