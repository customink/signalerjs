module.exports = {
  "extends": "eslint:recommended",
  "env": {
    "browser": true,
    "node": true,
    "es6": true,
    "mocha": true
  },
  "parser": "@babel/eslint-parser",
  "plugins":["@babel"],
  "parserOptions": {
    "ecmaVersion": 6,
    "ecmaFeatures": {
      "modules": true
    },
  },
  "globals": {
    "assert": false
  }
}
