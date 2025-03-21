module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'next',
  ],
  plugins: ['simple-import-sort', '@typescript-eslint', 'unused-imports'],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn', 
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-prototype-builtins': [
      'warn', 
    ],
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
    'react/jsx-key': 'off',  
    'no-useless-escape': 'off',  
    'react/no-unescaped-entities': 'off',
    '@typescript-eslint/no-empty-object-type': 'off',  
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          ['^\\u0000'],
          ['^react', '^@?\\w'],
          ['^(src|server|config|libs|public|locales)(/.*|$)'],
          ['^\\.'],
        ],
      },
    ],
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'import/no-anonymous-default-export': 'error',
    // HOOKS
    'react-hooks/rules-of-hooks': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/display-name': 'off',
  },
};


/*module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['simple-import-sort', '@typescript-eslint', 'unused-imports'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'next',
  ],
  rules: {
    'func-names': ['error', 'always'],
    // TS
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-empty-function': 'warn',
    // IMPORTS
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          ['^\\u0000'],
          ['^react', '^@?\\w'],
          ['^(src|server|config|libs|public|locales)(/.*|$)'],
          ['^\\.'],
        ],
      },
    ],
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'import/no-anonymous-default-export': 'error',

    // A11y
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/media-has-caption': 'off',

    // HOOKS
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'off',
    'react/display-name': 'off',
  },
};
*/