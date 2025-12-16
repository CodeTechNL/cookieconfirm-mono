import * as path from "path";
import { App } from "aws-cdk-lib";
import { ApplicationType } from "./types/ApplicationType";
import { execSync } from "node:child_process";

export const fromRoot = (...paths: string[]) => path.join(__dirname, "../../", ...paths);

export const env = (name: string): string => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
};

export const toPascalCase = (input: string) => {
    return input
        .replace(/[_\-\s]+/g, " ") // alles wat scheidt ? spatie
        .trim()
        .toLowerCase()
        .split(" ")
        .filter(Boolean) // lege delen weggooien
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
};

export const uuid = (): string => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0; // random nibble
        const v = c === "x" ? r : (r & 0x3) | 0x8; // variant bits
        return v.toString(16);
    });
};

export const getIdPrefix = (app: App): string => {
    const company = app.node.tryGetContext("company") || "cookie-confirm";
    const stage = app.node.tryGetContext("stage") || ("staging" as ApplicationType);
    return toPascalCase(company) + toPascalCase(stage);
};

export const getResourcePrefix = (app: App): string => {
    const company = app.node.tryGetContext("company") || "cookie-confirm";
    const stage = app.node.tryGetContext("stage") || ("staging" as ApplicationType);

    return `${company}-${stage}`;
};

export const getAwsEnv = (): { region: string; account: string } => {
    return {
        region: process.env.AWS_REGION!,
        account: process.env.AWS_ACCOUNT!,
    };
};

export function loadAwsProfileEnv(profile: string) {
    const out = execSync(
        `aws configure export-credentials --profile ${profile} --format env`,
        { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }
    );

    for (const rawLine of out.split("\n")) {
        const line = rawLine.trim();
        if (!line) continue;

        // accepteer zowel: KEY=VALUE als: export KEY=VALUE
        const cleaned = line.startsWith("export ") ? line.slice(7).trim() : line;
        const eq = cleaned.indexOf("=");
        if (eq === -1) continue;

        const key = cleaned.slice(0, eq).trim();
        const value = cleaned.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");

        process.env[key] = value;
    }
}

export function extractCapitals(input: string): string {
    return input.match(/[A-Z]/g)?.join('') ?? '';
}