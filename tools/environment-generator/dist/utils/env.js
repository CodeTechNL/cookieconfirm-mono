import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
export function loadAndMergeEnvFiles(files, baseDir = process.cwd()) {
    const result = {};
    for (const file of files) {
        const full = path.isAbsolute(file) ? file : path.join(baseDir, file);
        if (!fs.existsSync(full))
            continue;
        const content = fs.readFileSync(full, 'utf8');
        const parsed = dotenv.parse(content);
        // later files override earlier
        Object.assign(result, parsed);
    }
    return result;
}
