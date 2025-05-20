// jest.config.js


module.exports = {
  roots: [
    "src/tests"   // your separate test folder
  ],
  testMatch: [
    "**/?(*.)+(spec|test).[jt]s?(x)"  // Jest's default pattern for test files
  ],
  // ...other configurations
};
