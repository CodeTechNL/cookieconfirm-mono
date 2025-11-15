import * as path from "path"

export const fromRoot = (...paths: string[]) => path.join(__dirname, "../../", ...paths)

export const env = (name: string): string => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}