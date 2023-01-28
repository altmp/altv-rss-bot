import { build } from "esbuild";

build({
    bundle: true,
    // minify: true,
    format: "esm",
    platform: "node",
    keepNames: true,
    entryPoints: [
        {
            in: "./src/index.ts",
            out: "./index",
        },
    ],
    outdir: "./dist",
    banner: {
        js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
    },
});
