// @ts-ignore
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({});
const LOG_BUCKET = 'athena-consent-store';
// @ts-ignore
const LOG_PREFIX = process.env.LOG_PREFIX || "requests/";

export const handler = async (event: any) => {
    const now = new Date();
    const dt = now.toISOString().slice(0, 10);
    // @ts-ignore
    const hr = String(now.getUTCHours()).padStart(2, "0");

    const record = {
        ts: now.toISOString(),
        method: event?.requestContext?.http?.method ?? null,
        path: event?.rawPath ?? "/",
        ip: event?.requestContext?.http?.sourceIp ?? null,
        request_id: event?.requestContext?.requestId ?? null,
        headers: JSON.stringify(event?.headers ?? {}),
        query: JSON.stringify(event?.queryStringParameters ?? {}),
        body: event?.body ?? null,
        is_base64: !!event?.isBase64Encoded,
    };

    const key = `${LOG_PREFIX}dt=${dt}/hr=${hr}/${crypto.randomUUID()}.json`;

    await client.send(
        new PutObjectCommand({
            Bucket: LOG_BUCKET,
            Key: key,
            Body: JSON.stringify(record) + "\n",
            ContentType: "application/json",
        }),
    );

    return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ok: true }),
    };
};
