module.exports = {
    extends: [
      'airbnb-base', // use 'airbnb' if you're using React
      'plugin:prettier/recommended',
    ],
    env: {
      node: true,
      es6: true,
    },
    rules: {
      // Customize your rules here
      'prettier/prettier': ['warn'],
    },
  };
  