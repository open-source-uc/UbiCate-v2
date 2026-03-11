// @ts-check
const nextConfig = require("eslint-config-next/core-web-vitals");
const prettierConfig = require("eslint-config-prettier");
const pluginImport = require("eslint-plugin-import");
const pluginPrettier = require("eslint-plugin-prettier");
const unusedImports = require("eslint-plugin-unused-imports");
const tsParser = require("@typescript-eslint/parser");

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  // Global ignores
  {
    ignores: ["node_modules/**", ".next/**", ".vercel/**"],
  },

  // Next.js core-web-vitals flat config (registers import, @typescript-eslint, react, etc.)
  ...nextConfig,

  // Import plugin recommended rules (plugin already registered by nextConfig)
  { rules: pluginImport.flatConfigs.recommended.rules },

  // TypeScript + custom rules for TS/TSX files
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      prettier: pluginPrettier,
      "unused-imports": unusedImports,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      // Prettier formatting
      "prettier/prettier": "error",

      // Import order
      "import/order": [
        "error",
        {
          pathGroups: [
            { pattern: "@/**", group: "internal" },
            { pattern: "next/**", group: "builtin", position: "before" },
            { pattern: "react", group: "builtin", position: "before" },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          groups: ["builtin", "external", "internal", "parent", "sibling"],
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],

      // Unused imports
      "unused-imports/no-unused-imports": "warn",

      // React rules
      "react/prop-types": "warn",
      "react/self-closing-comp": "warn",
      "@next/next/no-img-element": "off",
      "react/function-component-definition": [
        "error",
        { namedComponents: "function-declaration" },
      ],
      "react/jsx-no-leaked-render": "error",
      "react/hook-use-state": "error",
    },
  },

  // Disable rules that conflict with Prettier (must be last)
  { rules: prettierConfig.rules },
];
