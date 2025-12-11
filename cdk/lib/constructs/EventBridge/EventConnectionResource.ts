import { SecretValue} from "aws-cdk-lib"
import {Construct} from "constructs"
import {Authorization, Connection, HttpParameter} from "aws-cdk-lib/aws-events";

type CookieScanRequestProps = {
    apiKey: string
    connectionName: string
}

export class EventConnectionResource extends Connection {
    constructor(scope: Construct, id: string, props: CookieScanRequestProps) {

        const {apiKey, connectionName} = props;

        super(scope, id, {
            authorization: Authorization.apiKey(
                'x-api-key',
                SecretValue.unsafePlainText(apiKey),
            ),
            connectionName,
            description: "A connection for sending AWS events to the Cookie Confirm backend",
            headerParameters: {
                'Content-Type': HttpParameter.fromString('application/json'),
            }
        });
    }
}
