module.exports = {
  "parser": "babel-eslint",
  "extends": ["eslint:recommended"],
  "plugins": [
    "babel", "react"
  ],
  "globals": {
    "cookie": true,
    "expect": true,
    "jsdom": true,
    "global": true
  },
  "env": {
    "es6": true,
    "jest": true,
    "node": true,
    "browser": true
  },
  "rules": {
    "eol-last": 2,
    "semi": [2, "always"],
    "semi-spacing": [2, { "before": false, "after": true }],
    "space-before-function-paren": [2, "never"],
    "quotes": [2, "single", "avoid-escape"],
    "babel/new-cap": 1,
    "babel/object-curly-spacing": 1,
    "object-shorthand": 1,
    "no-await-in-loop": 1,
    "no-unused-vars": [2, { "vars": "all", "args": "none" }],
    "comma-dangle": 1,
  }
};
