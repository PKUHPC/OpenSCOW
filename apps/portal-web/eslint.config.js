const base = require("../../eslint.config");
const react = require("@ddadaal/eslint-config/react");

module.export = [
  {
    ...base,
    ...react,
  },
  {
    ignores: ["public/monaco-assets/**"]
  },
];
