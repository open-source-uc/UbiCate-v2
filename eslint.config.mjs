import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import importPlugin from "eslint-plugin-import";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import unusedImports from "eslint-plugin-unused-imports";

export default defineConfig([
  ...nextVitals,
  // Solo las reglas de import/recommended: `eslint-config-next` ya registra el plugin `import`
  // (y su resolver de TypeScript), y registrarlo de nuevo revienta con "Cannot redefine plugin".
  { rules: importPlugin.flatConfigs.recommended.rules },
  // Va antes del bloque de reglas propio para que eslint-config-prettier no apague
  // react/self-closing-comp, que sí queremos activo.
  prettierRecommended,
  {
    plugins: { "unused-imports": unusedImports },
    rules: {
      /* General Rules */
      // Prettier formatting must pass
      "prettier/prettier": "error",
      // Import order
      "import/order": [
        "error",
        {
          pathGroups: [
            // Internal between external and relative
            {
              pattern: "@/**",
              group: "internal",
            },
            // Next as the second group
            {
              pattern: "next/**",
              group: "builtin",
              position: "before",
            },
            // React in the first group
            {
              pattern: "react",
              group: "builtin",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          groups: ["builtin", "external", "internal", "parent", "sibling"],
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      // Unused imports
      "unused-imports/no-unused-imports": "warn",
      /* React Rules */
      // Components must have explicit types
      "react/prop-types": "warn",
      // Prefer self-closing components without children
      "react/self-closing-comp": "warn",
      // We don't need NextJS's Image element
      "@next/next/no-img-element": "off",
      // Consistency in component definition
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "function-declaration",
        },
      ],
      // Avoid rendering bugs in conditional rendering with &&
      "react/jsx-no-leaked-render": "error",
      // useState should be destructured
      "react/hook-use-state": "error",
    },
  },
  globalIgnores([
    "loadtest/**",
    "generated/**",
    "self-host-map/**",
    ".open-next/**",
    ".vercel/**",
    ".wrangler/**",
    // Generado por `wrangler types` y por Serwist: no tiene sentido lintearlos.
    "env.d.ts",
    "public/sw.js",
    "public/swe-worker*.js",
  ]),
]);
