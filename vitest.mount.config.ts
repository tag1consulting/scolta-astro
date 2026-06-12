import { getViteConfig } from "astro/config";

// Separate vitest pass for the .astro component mount smoke: getViteConfig
// pulls in Astro's compiler pipeline (needed to import a .astro file), which
// the plain unit suite should not run under.
export default getViteConfig({
  test: {
    include: ["tests-mount/**/*.test.ts"],
    environment: "node",
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
