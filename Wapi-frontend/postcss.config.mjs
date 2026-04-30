import path from "node:path";
import { fileURLToPath } from "node:url";

/** App root (`Wapi-frontend/`); avoids using `process.cwd()` when the monorepo root is cwd. */
const appRoot = path.dirname(fileURLToPath(import.meta.url));

/** Use string-key plugin so Next/Turbopack does not bundle `@tailwindcss/postcss` (native lightningcss). */
export default {
  plugins: {
    "@tailwindcss/postcss": { base: appRoot },
  },
};
