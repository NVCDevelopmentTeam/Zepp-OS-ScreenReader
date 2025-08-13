import { defineConfig } from 'eslint/config'
import { includeIgnoreFile } from '@eslint/compat'
import js from '@eslint/js'
import eslintPluginSvelte from 'eslint-plugin-svelte'
import prettierConfig from 'eslint-config-prettier'
import globals from 'globals'
import svelteParser from 'svelte-eslint-parser'
import svelteConfig from './svelte.config.js'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
// Resolve full absolute path to `.gitignore`
const gitignorePath = resolve(__dirname, '.gitignore')

/** @type {import('eslint').Linter.FlatConfig[]} */
export default defineConfig([
  // 1. Load ignore patterns from .gitignore using absolute path
  includeIgnoreFile(gitignorePath),

  // 2. JS + Svelte + Prettier recommended configs
  js.configs.recommended,
  ...eslintPluginSvelte.configs['flat/recommended'],
  prettierConfig,
  ...eslintPluginSvelte.configs['flat/prettier'],

  // 3. Set global browser + node globals
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        client: 'readonly',
        gtag: 'readonly'
      },
      ecmaVersion: 'latest',
      sourceType: 'module'
    }
  },

  // 4. Specific overrides for `.svelte` files
  {
    files: ['**/*.svelte', '**/*.svelte.js'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        svelteConfig
      }
    },
    rules: {
      'svelte/no-parsing-error': 'off'
    }
  },

  // 5. Additional ignore patterns
  {
    files: ['src/lib/components/PostPreview.svelte'],
    rules: {
      'svelte/no-at-html-tags': 'off'
    }
  },
  {
    ignores: ['dist/**', '**/*.config.js']
  }
])
