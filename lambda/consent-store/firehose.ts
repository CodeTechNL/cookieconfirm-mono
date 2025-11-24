import { FirehoseClient, PutRecordCommand } from "@aws-sdk/client-firehose";

const firehose = new FirehoseClient({}); // region from Lambda env

import {ConsentLogInterface} from "./ConsentLogInterface";
import {
    LambdaFunctionURLEvent,
    LambdaFunctionURLResult,
    Context,
} from 'aws-lambda'
import {extractDomain, getRequestData} from "./helpers";

export const handler = async (
    event: LambdaFunctionURLEvent,
    _context: Context
): Promise<LambdaFunctionURLResult> => {
    console.log('Firehose handler started');
    const requestData = getRequestData(event);
    const now = new Date();

    const record = {
        uuid: requestData.id,
        ip_address: event.requestContext.http.sourceIp,
        country: '',
        domain: requestData.domain,
        page_url: requestData.path,
        user_agent: event.requestContext.http.userAgent,
        updated_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        website: requestData.domain,
        consent_method: requestData.consentMethod,
        accepted_marketing: !!requestData.marketing,
        accepted_analytics: !!requestData.analytics,
        accepted_functional: true,
    } as unknown as ConsentLogInterface;

    // CORS preflight
    if (event.requestContext?.http?.method === 'OPTIONS') {
        return response(200, '');
    }


// Accept JSON body or NDJSON already
    const raw = JSON.stringify(record);
    const line = raw.endsWith('\n') ? raw : raw + '\n'; // NDJSON: one line per record

    await firehose.send(new PutRecordCommand({
        DeliveryStreamName: process.env.DELIVERY_STREAM_NAME!,
        Record: { Data: new TextEncoder().encode(line) }
    }));

    return response(200, JSON.stringify(record));
};

function response(status: number, body: string) {
    return {
        statusCode: status,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'POST,OPTIONS',
            'Content-Type': 'text/plain; charset=utf-8'
        },
        body
    };
}