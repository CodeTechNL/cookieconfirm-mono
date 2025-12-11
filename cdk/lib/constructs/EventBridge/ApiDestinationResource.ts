import {Construct} from "constructs"
import {ApiDestination, Connection, HttpMethod} from "aws-cdk-lib/aws-events";

type ApiDestinationProps = {
    connection: Connection
    endpoint: string
}

export class ApiDestinationResource extends ApiDestination {
    constructor(scope: Construct, id: string, props: ApiDestinationProps) {
        const {connection, endpoint} = props;

        super(scope, id, {
            endpoint,
            connection,
            apiDestinationName: "CookieScanApiEndpoint",
            description: "Endpoint to send the cookie scan results to",
            httpMethod: HttpMethod.POST,
            rateLimitPerSecond: 5,
        });
    }
}
