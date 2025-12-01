import * as path from "path"

export const fromRoot = (...paths: string[]) => path.join(__dirname, "../../", ...paths)

export const env = (name: string): string => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

export const toPascalCase = (input: string) => {
    return input
        .replace(/[_\-\s]+/g, ' ')                 // alles wat scheidt ? spatie
        .trim()
        .toLowerCase()
        .split(' ')
        .filter(Boolean)                           // lege delen weggooien
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

export const uuid = ():string=> {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;          // random nibble
        const v = c === 'x' ? r : (r & 0x3 | 0x8); // variant bits
        return v.toString(16);
    });
}