module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'prettier'
  ],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': 'error',
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'prefer-const': 'error',
    'no-var': 'error',
  },
};