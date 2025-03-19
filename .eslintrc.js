module.exports = {
  "env": {
    "node": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended", // Base rules from ESLint
    "plugin:node/recommended", // Node.js-specific rules
    "prettier" // Integration with Prettier for code formatting
  ],
  "parserOptions": {
    "ecmaVersion": 2021, // Supports modern JavaScript
    "sourceType": "module" // Allows ES module syntax (import/export)
  },
  "plugins": ["node"],
  "rules": {
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }], // Prevent unused variables, ignore those starting with '_'
    "no-undef": "error", // Disallow undefined variables
    "no-console": "off", // Allow use of console.log (common in Node.js)
    "eqeqeq": "error", // Enforce use of === and !==
    "curly": "error", // Enforce curly braces for all control statements
    "strict": ["error", "global"], // Enforce strict mode globally
    "no-var": "error", // Disallow var, use let or const instead
    "prefer-const": "error", // Prefer const when variables are not reassigned
    "arrow-spacing": ["error", { "before": true, "after": true }], // Consistent spacing around arrow functions
    "semi": ["error", "always"], // Require semicolons
    "quotes": ["error", "single", { "avoidEscape": true }] // Use single quotes, allow double quotes to avoid escaping
  }
}
;
