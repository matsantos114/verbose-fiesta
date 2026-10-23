// @ts-check
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  // Never lint compiled output.
  { ignores: ["dist/"] },

  // Recommended rule sets for JavaScript and TypeScript.
  eslint.configs.recommended,
  tseslint.configs.recommended,

  // Our own tweaks.
  {
    rules: {
      // Allow unused function parameters whose names start with "_".
      // Express error handlers must declare 4 parameters even when you don't use all of them.
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
);
