module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: 'eslint:recommended',
  rules: {
    semi: ['error', 'always'],
    'no-cond-assign': ['error', 'except-parens'],
    camelcase: 'error',
    curly: 'off',
    eqeqeq: 'error',
    'no-eq-null': 'error',
    'wrap-iife': 'off',
    indent: [
      'error',
      2,
      {
        SwitchCase: 1,
      },
    ],
    'no-use-before-define': 'off',
    'linebreak-style': ['error', 'unix'],
    'comma-style': ['error', 'last'],
    complexity: ['error', 15],
    'max-depth': ['error', 4],
    'max-statements': ['error', 25],
    'new-cap': 'error',
    'no-empty': [
      'error',
      {
        allowEmptyCatch: true,
      },
    ],
    'no-new': 'off',
    quotes: ['error', 'single'],
    strict: 'off',
    'no-undef': 'error',
    'no-unused-vars': 'error',
    'eol-last': 'error',
    'key-spacing': [
      'error',
      {
        beforeColon: false,
        afterColon: true,
      },
    ],
    'no-trailing-spaces': 'error',
    'space-infix-ops': 'error',
    'keyword-spacing': ['error', {}],
    'space-unary-ops': [
      'error',
      {
        words: false,
        nonwords: false,
      },
    ],
    'brace-style': [
      'error',
      '1tbs',
      {
        allowSingleLine: true,
      },
    ],
  },
};
