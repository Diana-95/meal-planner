module.exports = {
  parser: '@typescript-eslint/parser',
    extends: [
      'airbnb-base', // use 'airbnb' if you're using React
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
    ],
    plugins: ['@typescript-eslint'],
    env: {
      node: true,
      es6: true,
    },
    parserOptions: {
      ecmaVersion: 2020,                  // Allows parsing of modern JavaScript
      sourceType: 'module',               // Allows using ES Modules
    },
    rules: {
      // Customize your rules here
      'prettier/prettier': ['warn'],
      'import/no-unresolved': ['off'],
      'import/extensions': ['off']
    },
  };
  