import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import antfu from '@antfu/eslint-config';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import playwright from 'eslint-plugin-playwright';
import storybook from 'eslint-plugin-storybook';
import tailwind from 'eslint-plugin-tailwindcss';

export default antfu(
  {
    react: true,
    nextjs: true,
    typescript: true,

    // Configuration preferences
    lessOpinionated: true,
    isInEditor: false,

    // Code style
    stylistic: {
      semi: true,
    },

    // Format settings
    formatters: {
      css: true,
    },

    // Ignored paths
    ignores: [
      'migrations/**/*',
      'docs/**/*',
      '.kiro/**/*',
      '.next/**/*',
    ],
  },
  // --- Accessibility Rules ---
  jsxA11y.flatConfigs.recommended,
  // --- Tailwind CSS Rules ---
  ...tailwind.configs['flat/recommended'],
  {
    settings: {
      tailwindcss: {
        config: `${dirname(fileURLToPath(import.meta.url))}/src/styles/global.css`,
      },
    },
  },
  // --- E2E Testing Rules ---
  {
    files: [
      '**/*.spec.ts',
      '**/*.e2e.ts',
    ],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-standalone-expect': 'warn',
    },
  },
  // --- Storybook Rules ---
  ...storybook.configs['flat/recommended'],
  // --- Custom Rule Overrides ---
  {
    rules: {
      'antfu/no-top-level-await': 'off', // Allow top-level await
      'style/brace-style': ['error', '1tbs'], // Use the default brace style
      'ts/consistent-type-definitions': ['error', 'type'], // Use `type` instead of `interface`
      'react/prefer-destructuring-assignment': 'off', // Vscode doesn't support automatically destructuring, it's a pain to add a new variable
      'node/prefer-global/process': 'off', // Allow using `process.env`
      'test/padding-around-all': 'error', // Add padding in test files
      'test/prefer-lowercase-title': 'off', // Allow using uppercase titles in test titles
      // Temporarily relaxed rules
      'no-alert': 'warn',
      'ts/no-use-before-define': 'off',
      'ts/no-require-imports': 'off',
      'unused-imports/no-unused-vars': 'warn',
      'style/multiline-ternary': 'off',
      'next/no-html-link-for-pages': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks-extra/no-direct-set-state-in-use-effect': 'off',
      'react/no-unstable-default-props': 'warn',
      'react/no-unstable-context-value': 'warn',
      'react-dom/no-missing-button-type': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      'tailwindcss/no-custom-classname': 'off',
      'react-refresh/only-export-components': 'off',
      'jsdoc/check-param-names': 'off',
      'jsonc/no-dupe-keys': 'error',

      'style/no-tabs': 'warn',
      'react-web-api/no-leaked-timeout': 'warn',
      'react/prefer-use-state-lazy-initialization': 'warn',
      'ts/ban-ts-comment': 'warn',
    },
  },
);
