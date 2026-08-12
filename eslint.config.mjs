// @ts-check
// Keep Nuxt's generated module configuration, then apply the upstream Nuxt rules.
import withNuxt from './.nuxt/eslint.config.mjs'
// @ts-expect-error missing types
import noOnlyTests from 'eslint-plugin-no-only-tests'
import typegen from 'eslint-typegen'
import perfectionist from 'eslint-plugin-perfectionist'
import { importX } from 'eslint-plugin-import-x'
import parser from '@typescript-eslint/parser'
import markdown from '@eslint/markdown'
import { runtimeDependencies } from 'nuxt/meta'

export default withNuxt()
  .prepend(
    {
      // Ignores have to be a separate object to be treated as global ignores.
      // Don't add other attributes to this object.
      ignores: [
        '.data/**',
        '.nuxt/**',
        '.output/**',
        '.pnpm-store/**',
        'dist/**',
        'node_modules/**',
      ],
    },
    {
      languageOptions: {
        globals: {
          $fetch: 'readonly',
          NodeJS: 'readonly',
        },
      },
      name: 'local/settings',
      settings: {
        jsdoc: {
          ignoreInternal: true,
          tagNamePreference: {
            note: 'note',
            warning: 'warning',
          },
        },
      },
    },
  )
  .override('nuxt/javascript', {
    rules: {
      'curly': ['error', 'all'],
      'dot-notation': 'error',
      'logical-assignment-operators': ['error', 'always', { enforceForIfStatements: true }],
      'no-console': ['warn', { allow: ['warn', 'error', 'debug'] }],
      'no-lonely-if': 'error',
      'no-useless-rename': 'error',
      'object-shorthand': 'error',
      'prefer-const': ['error', { destructuring: 'any', ignoreReadBeforeAssign: false }],
      'require-await': 'error',
      'sort-imports': ['error', { ignoreDeclarationSort: true }],
    },
  })
  .override('nuxt/typescript/rules', {
    rules: {
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': true,
        },
      ],
      '@typescript-eslint/no-dynamic-delete': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '',
        },
      ],
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/unified-signatures': 'off',
      ...{
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-invalid-void-type': 'off',
      },
    },
  })
  .append({
    files: ['packages/**/*.{mjs,js,ts}', '**/*.{spec,test}.{mjs,js,ts}'],
    ignores: [
      'packages/nuxt/src/app/types/augments.ts',
      'test/fixtures/basic/app/plugins/this-should-not-load.spec.js',
    ],
    languageOptions: {
      parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/return-await': ['error', 'in-try-catch'],
      'no-return-await': 'off',
    },
  })
  .override('nuxt/tooling/unicorn', {
    rules: {
      'unicorn/no-new-array': 'off',
      'unicorn/prefer-dom-node-text-content': 'off',
    },
  })
  .override('nuxt/vue/rules', {
    rules: {},
  })
  .override('nuxt/stylistic', {
    rules: {
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/indent-binary-ops': 'off',
      '@stylistic/max-statements-per-line': 'off',
      '@stylistic/operator-linebreak': 'off',
      '@stylistic/quote-props': ['error', 'consistent'],
      '@stylistic/space-before-function-paren': ['error', 'always'],
    },
  })
  .append(
    {
      files: ['*.{js,ts}', 'scripts/**/*.{js,ts}', 'packages/**/*.{mts,ts,mjs,js}'],
      ignores: ['packages/**/*.client.ts', 'packages/**/*.client.mts', 'packages/**/*.client.js', 'packages/**/*.client.mjs'],
      name: 'local/requires/explicit-node-imports',
      rules: {
        'no-restricted-globals': [
          'error',
          {
            message: 'Use explicit import: import process from "node:process" (or a scoped alias). Implicit globals are banned for clarity and tree-shakability.',
            name: 'process',
          },
          {
            message: 'Use explicit import: import { performance } from "node:perf_hooks". Implicit global performance is banned in server contexts to ensure Node.js-specific usage.',
            name: 'performance',
          },
        ],
      },
    },
    {
      files: ['**/*.vue', '**/*.ts', '**/*.mts', '**/*.js', '**/*.cjs', '**/*.mjs'],
      name: 'local/rules',
      plugins: {
        'import-x': importX,
      },
      rules: {
        'import-x/no-restricted-paths': [
          'error',
          {
            zones: [
              {
                from: 'packages/nuxt/src/!(core)/runtime/*',
                message: 'core should not directly import from modules.',
                target: 'packages/nuxt/src/core',
              },
              {
                from: 'packages/nuxt/src/!(app)/**/*',
                message: 'app should not directly import from modules.',
                target: 'packages/nuxt/src/app',
              },
              {
                from: 'packages/nuxt/src/app/**/index.ts',
                message: 'should not import from barrel/index files',
                target: 'packages/nuxt/src',
              },
              {
                from: 'packages/nitro',
                message: 'nitro should not directly import other packages.',
                target: 'packages/!(nitro)/**/*',
              },
            ],
          },
        ],
        'jsdoc/check-tag-names': [
          'error',
          {
            definedTags: [
              'experimental',
              '__NO_SIDE_EFFECTS__',
            ],
          },
        ],
      },
    },
    {
      files: ['packages/*/src/**'],
      ignores: ['packages/nuxt/src/app/**', '**/runtime/**/*'],
      name: 'local/import-extensions',
      plugins: {
        'import-x': importX,
      },
      rules: {
        'import/extensions': ['error', 'always', {
          ignorePackages: true,
          js: 'always',
          ts: 'always',
          vue: 'always',
        }],
      },
    },
    {
      files: ['packages/nuxt/src/app/**', 'test/**', '**/runtime/**', '**/*.test.ts'],
      name: 'local/disables/client-console',
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: ['packages/nuxt/src/app/**', 'packages/nuxt/src/{components,head,imports,pages}/runtime/**'],
      name: 'local/disables/empty-object-type',
      rules: {
        '@typescript-eslint/no-empty-object-type': ['error', { allowObjectTypes: 'always' }],
      },
    },
    {
      files: ['packages/**/diagnostics/**', 'packages/**/diagnostics.ts'],
      name: 'local/diagnostics-pure-annotations',
      rules: {
        '@stylistic/array-bracket-spacing': 'off',
      },
    },
    {
      files: ['packages/nuxt/src/app/**', 'packages/nuxt/src/(components,head,imports,pages)/runtime/**'],
      name: 'local/client-packages',
      rules: {
        '@typescript-eslint/no-restricted-imports': ['error', {
          patterns: [
            {
              allowTypeImports: true,
              regex: `^(?!(${[
                '@unhead',
                '@vue/shared',
                'ofetch',
                'vue/server-renderer',
                'vue',
                'vue-router',
                ...runtimeDependencies,
                'errx',
                'nostics',
                'nuxt/app',
              ].map(r => r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})($|/))(?!#)(?!\\.)[a-zA-Z@]`,
            },
          ],
        }],
      },
    },
    {
      files: ['**/fixtures/**', '**/fixture/**', '**/*-fixture/**'],
      name: 'local/disables/fixtures',
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/triple-slash-reference': 'off',
        'nuxt/no-nuxt-config-test-key': 'off',
        'vue/multi-word-component-names': 'off',
        'vue/valid-v-for': 'off',
      },
    },
    {
      files: ['test/**', '**/*.test.ts'],
      name: 'local/disables/tests',
      plugins: {
        'no-only-tests': noOnlyTests,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
        'no-only-tests/no-only-tests': 'error',
      },
    },
    {
      files: ['**/eslint.config.mjs'],
      name: 'local/sort-eslint-config',
      plugins: {
        perfectionist,
      },
      rules: {
        'perfectionist/sort-objects': 'error',
      },
    },
    {
      files: ['packages/nuxt/src/app/components/welcome.vue'],
      rules: {
        'vue/multi-word-component-names': 'off',
      },
    },
    {
      files: ['**/*.md'],
      language: 'markdown/commonmark',
      name: 'local/docs-markdown',
      plugins: {
        markdown,
      },
      processor: 'markdown/markdown',
    },
    {
      files: ['**/*.md/**/*'],
      rules: {
        '@stylistic/keyword-spacing': 'off',
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'import/first': 'off',
        'no-console': 'off',
        'no-unused-vars': 'off',
        'vue/no-unused-vars': 'off',
        'vue/require-v-for-key': 'off',
      },
    },
  )
  .onResolved(configs => typegen(configs))
