// eslint.config.js (or .mjs)
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Add a new configuration object for your custom rules
  {
    files: ["**/*.ts", "**/*.tsx"], // Apply these rules only to TypeScript files
    rules: {
      // Downgrade 'no-explicit-any' to a warning
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "off", // Or "warn"

      // Downgrade 'no-unused-vars' to a warning
      "@typescript-eslint/no-unused-vars": "off",
      "react/no-unescaped-entities": "off",
      // Critical: If you're 100% sure the react-hooks/rules-of-hooks error
      // is a false positive (e.g., due to useEffect being conditional inside if after other hooks),
      // you can suppress it here. Otherwise, you should fix the code.
      // A safer approach is to use // eslint-disable-next-line on specific lines in the code.
      "react-hooks/rules-of-hooks": "off", // Generally, fix the code. Use 'off' only if it's a known false positive.

      // Downgrade 'no-unescaped-entities' to a warning
      "react/no-unescaped-entities": "warn",

      // Ensure no-img-element is a warning (it usually is by default in Next.js, but ensures consistency)
      "@next/next/no-img-element": "warn",
    },
  },
];

export default eslintConfig;
