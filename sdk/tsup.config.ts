import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    qr: "src/qr.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  external: ["viem"],
});
