// Selepas `next build`, tambah komen kredit di atas <html> dalam setiap halaman
// statik. Komen ini hanya nampak dalam inspect element / view source.
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CREDIT = "<!--\n    Build by Trulab Studio · 60176982032\n-->";
const DOCTYPE = "<!DOCTYPE html>";
const root = path.join(process.cwd(), ".next", "server", "app");

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return htmlFiles(full);
      return entry.name.endsWith(".html") ? [full] : [];
    }),
  );
  return files.flat();
}

let count = 0;
for (const file of await htmlFiles(root)) {
  const html = await readFile(file, "utf8");
  if (!html.startsWith(DOCTYPE) || html.includes(CREDIT)) continue;
  await writeFile(file, `${DOCTYPE}\n${CREDIT}\n${html.slice(DOCTYPE.length)}`);
  count += 1;
}
console.log(`Kredit ditambah pada ${count} halaman.`);
