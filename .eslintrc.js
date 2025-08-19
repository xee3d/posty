module.exports = {
  root: true,
  extends: [
    '@react-native-community',
    '@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // Production-ready rules
    'no-console': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-empty-function': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'react-native/no-inline-styles': 'warn',
    
    // Performance rules
    'react/jsx-no-bind': 'warn',
    'react-hooks/rules-of-hooks': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    'android/',
    'ios/',
    '*.config.js',
    '__tests__/',
  ],
};