import { nodeConfig } from "@reqres/eslint-config/node";
import globals from "globals";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nodeConfig,
  {
    files: ["tests/**/*.test.js", "tests/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
