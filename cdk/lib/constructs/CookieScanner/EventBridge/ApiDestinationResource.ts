import {Construct} from "constructs"
import {ApiDestination, Authorization, Connection, HttpMethod, HttpParameter} from "aws-cdk-lib/aws-events";
import {Endpoint} from "aws-cdk-lib/aws-rds";


type ApiDestinationProps = {
    connection: Connection
    endpoint: string
}

export class ApiDestinationResource extends ApiDestination {
    constructor(scope: Construct, id: string, props: ApiDestinationProps) {
        const {connection, endpoint} = props;
        const baseProps = {
            endpoint,
            connection,
            apiDestinationName: "CookieScanApiEndpoint",
            description: "Endpoint to send the cookie scan results to",
            httpMethod: HttpMethod.POST,
            rateLimitPerSecond: 5,
        };

        super(scope, id, baseProps);
    }
}
