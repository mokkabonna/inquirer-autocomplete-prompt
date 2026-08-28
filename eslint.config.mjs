import js from '@eslint/js';
import parser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  {
    ignores: ['**/coverage/**', '**/dist/**', '**/node_modules/**'],
  },
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.node,
        readline$Interface: 'readonly',
      },
      parser,
      sourceType: 'module',
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-cond-assign': ['error', 'except-parens'],
      camelcase: 'error',
      eqeqeq: 'error',
      'no-eq-null': 'error',
      'no-use-before-define': 'off',
      complexity: ['error', 15],
      'max-depth': ['error', 4],
      'max-statements': ['error', 50],
      'new-cap': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-new': 'off',
      'no-unused-vars': 'off',
    },
  },
];
