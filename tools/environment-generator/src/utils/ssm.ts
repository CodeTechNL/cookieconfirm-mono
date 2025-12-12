import { SSMClient, GetParametersByPathCommand, PutParameterCommand, Parameter } from "@aws-sdk/client-ssm";
import { fromIni } from "@aws-sdk/credential-providers";

export type SsmMap = Record<string, string>;

export function createSsmClient(region?: string): SSMClient {
    const cfg: any = {
        region: region || process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "eu-west-1",
    };
    // If an AWS profile is provided, use it explicitly via shared credentials/config files
    if (process.env.AWS_PROFILE) {
        cfg.credentials = fromIni({ profile: process.env.AWS_PROFILE });
    }
    return new SSMClient(cfg);
}

export async function fetchSsmParametersByPrefix(client: SSMClient, prefix: string): Promise<SsmMap> {
    const map: SsmMap = {};
    let nextToken: string | undefined;
    do {
        const cmd = new GetParametersByPathCommand({
            Path: prefix,
            Recursive: true,
            WithDecryption: true,
            NextToken: nextToken,
            MaxResults: 10,
        });
        const res = await client.send(cmd);
        (res.Parameters || []).forEach((p: Parameter) => {
            if (!p.Name || p.Value === undefined) return;
            // Key is the last segment after prefix '/'
            const key = p.Name.replace(prefix + "/", "");
            if (key.length) map[key] = String(p.Value);
        });
        nextToken = res.NextToken;
    } while (nextToken);
    return map;
}

export async function putSsmParameter(client: SSMClient, name: string, value: string, type: "String" | "SecureString" = "String"): Promise<void> {
    await client.send(
        new PutParameterCommand({
            Name: name,
            Value: value,
            Type: type,
            Overwrite: true,
        }),
    );
}
