import { cp, lstat, mkdir, realpath, rm, stat } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const defaultRoot = fileURLToPath(new URL("../", import.meta.url));
const publicFiles = ["index.html", "styles.css", "config.js"];
const publicDirectories = ["assets", "js"];

export async function buildStaticSite(projectRoot = defaultRoot) {
  const root = await realpath(projectRoot);
  const output = resolve(root, "dist");
  if (dirname(output) !== root || basename(output) !== "dist") {
    throw new Error("O diretório de saída deve ser dist dentro do projeto.");
  }

  for (const name of [...publicFiles, ...publicDirectories]) {
    const info = await stat(join(root, name));
    const valid = publicFiles.includes(name)
      ? info.isFile()
      : info.isDirectory();
    if (!valid)
      throw new Error(`Arquivo ou diretório de publicação inválido: ${name}`);
  }

  try {
    const info = await lstat(output);
    if (
      !info.isDirectory() ||
      info.isSymbolicLink() ||
      (await realpath(output)) !== output
    ) {
      throw new Error("dist precisa ser uma pasta real dentro do projeto.");
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  await Promise.all(
    [...publicFiles, ...publicDirectories].map((name) =>
      cp(join(root, name), join(output, name), { recursive: true }),
    ),
  );
  return output;
}

if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
) {
  try {
    const output = await buildStaticSite();
    console.log(`Site estático pronto: ${output}`);
  } catch (error) {
    console.error(`Falha ao gerar o site estático: ${error.message}`);
    process.exitCode = 1;
  }
}
