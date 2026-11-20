// Builds the extension into dist/: bundles the TypeScript entry points with esbuild and copies the static files.
// Usage: node tools/build.mjs [--watch]
// Load dist/ in Edge or Chrome via "Load unpacked" (developer mode).

import { context } from "esbuild";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src");
const dist = join(root, "dist");
const watch = process.argv.includes("--watch");

/** Static files copied as they are: [from (in src), to (in dist)]. */
const staticFiles = [
  ["popup/popup.html", "popup.html"],
  ["_locales/en/messages.json", "_locales/en/messages.json"],
  ["_locales/tr/messages.json", "_locales/tr/messages.json"],
];

/** CSS files concatenated, in order, into one stylesheet per target. */
const stylesheets = {
  "content.css": ["styles/features.css"],
  "popup.css": ["styles/tokens.css", "popup/popup.css"],
};

async function copyStatic() {
  await mkdir(dist, { recursive: true });
  for (const [from, to] of staticFiles) {
    await mkdir(dirname(join(dist, to)), { recursive: true });
    await copyFile(join(src, from), join(dist, to));
  }

  for (const [target, parts] of Object.entries(stylesheets)) {
    const texts = await Promise.all(parts.map((p) => readFile(join(src, p), "utf8")));
    await writeFile(join(dist, target), texts.join("\n"));
  }

  // The manifest version follows package.json, so there is one version number.
  const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  const manifest = JSON.parse(await readFile(join(src, "manifest.json"), "utf8"));
  manifest.version = pkg.version;
  await writeFile(join(dist, "manifest.json"), JSON.stringify(manifest, null, 2));
}

const ctx = await context({
  entryPoints: {
    content: join(src, "content/main.ts"),
    popup: join(src, "popup/popup.ts"),
  },
  outdir: dist,
  bundle: true,
  format: "iife",
  target: ["chrome120"],
  minify: !watch,
  sourcemap: watch ? "inline" : false,
  legalComments: "none",
  logLevel: "info",
  plugins: [
    {
      name: "copy-static",
      setup(build) {
        build.onEnd(async (result) => {
          if (result.errors.length === 0) {
            await copyStatic();
          }
        });
      },
    },
  ],
});

if (watch) {
  await ctx.watch();
  console.log("Watching src/ ... (Ctrl+C to stop; reload the extension in the browser after a change)");
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
