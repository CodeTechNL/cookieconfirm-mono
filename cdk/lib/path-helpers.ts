import * as path from "path"

export const fromRoot = (...paths: string[]) => path.join(__dirname, "../../", ...paths)
