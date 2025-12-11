import * as path from "path"
import {App} from "aws-cdk-lib";
import {ApplicationType} from "./types/ApplicationType";

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

export const getIdPrefix = (app: App): string => {
    const company = app.node.tryGetContext('company') || 'cookie-confirm'
    const stage = app.node.tryGetContext('stage') || 'staging' as ApplicationType;
    return toPascalCase(company) + toPascalCase(stage)
}

export const getResourcePrefix = (app: App) : string => {
    const company = app.node.tryGetContext('company') || 'cookie-confirm'
    const stage = app.node.tryGetContext('stage') || 'staging' as ApplicationType;

    return `${company}-${stage}`;
}

export const getAwsEnv = () : {region: string, account: string} => {
    return {
        region: process.env.CDK_DEFAULT_REGION!,
        account: process.env.CDK_DEFAULT_ACCOUNT!,
    };
}