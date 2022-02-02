module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  env: {
    browser: true,
    'jest/globals': true,
    node: true,
    es6: true,
    mocha: true
  },
  parser: '@babel/eslint-parser',
  plugins: ['@babel', 'jest'],
  parserOptions: {
    ecmaVersion: 6,
    ecmaFeatures: {
      modules: true
    }
  },
  globals: {
    assert: false
  }
};
