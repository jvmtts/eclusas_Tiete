import test from "node:test";
import assert from "node:assert/strict";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { buildStaticSite } from "../scripts/build.mjs";

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "eclusas-build-"));
  t.after(async () => {
    const resolved = await realpath(root);
    const parent = await realpath(tmpdir());
    if (
      dirname(resolved) !== parent ||
      !basename(resolved).startsWith("eclusas-build-")
    )
      throw new Error("Pasta de teste inesperada.");
    await rm(root, { recursive: true, force: true });
  });
  await mkdir(join(root, "assets"));
  await mkdir(join(root, "js"));
  await writeFile(
    join(root, "index.html"),
    '<!doctype html><title>Expedição</title><script type="module" src="./js/app.js"></script>',
  );
  await writeFile(join(root, "styles.css"), "body { color: green; }");
  await writeFile(
    join(root, "config.js"),
    'export const CONFIG = { basinEndpoint: "https://usebasin.com/f/9de4a82af40b" };',
  );
  await writeFile(
    join(root, "js", "app.js"),
    'import { CONFIG } from "../config.js";',
  );
  await writeFile(
    join(root, "assets", "logo.svg"),
    '<svg xmlns="http://www.w3.org/2000/svg"/>',
  );
  await writeFile(
    join(root, "server.mjs"),
    "Servidor de prévia, não publicar.",
  );
  await writeFile(join(root, "README.md"), "Documentação, não publicar.");
  return root;
}

test("production output contains index and client modules, without the preview server", async (t) => {
  const root = await fixture(t);
  const output = await buildStaticSite(root);
  assert.deepEqual((await readdir(output)).sort(), [
    "assets",
    "config.js",
    "index.html",
    "js",
    "styles.css",
  ]);
  assert.match(await readFile(join(output, "index.html"), "utf8"), /Expedição/);
  assert.match(
    await readFile(join(output, "js", "app.js"), "utf8"),
    /config\.js/,
  );
  await access(join(output, "assets", "logo.svg"));
  await assert.rejects(access(join(output, "server.mjs")));
});

test("rebuilding removes obsolete published files", async (t) => {
  const root = await fixture(t);
  const output = await buildStaticSite(root);
  await writeFile(join(output, "obsolete.txt"), "Arquivo obsoleto.");
  await buildStaticSite(root);
  await assert.rejects(access(join(output, "obsolete.txt")));
});

test("missing required source fails before replacing a previous output", async (t) => {
  const root = await fixture(t);
  const output = await buildStaticSite(root);
  await rm(join(root, "index.html"));
  await assert.rejects(buildStaticSite(root));
  assert.match(await readFile(join(output, "index.html"), "utf8"), /Expedição/);
});
