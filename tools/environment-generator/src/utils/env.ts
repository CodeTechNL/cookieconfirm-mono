import fs from "fs";
import path from "path";
import dotenv from "dotenv";

export type EnvMap = Record<string, string>;

export function loadAndMergeEnvFiles(files: string[], baseDir: string = process.cwd()): EnvMap {
  const result: EnvMap = {};
  for (const file of files) {
    const full = path.isAbsolute(file) ? file : path.join(baseDir, file);
    if (!fs.existsSync(full)) continue;
    const content = fs.readFileSync(full, "utf8");
    const parsed = dotenv.parse(content);
    // later files override earlier
    Object.assign(result, parsed);
  }
  return result;
}
