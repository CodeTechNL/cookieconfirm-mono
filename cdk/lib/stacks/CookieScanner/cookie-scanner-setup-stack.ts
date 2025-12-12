import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";
import { CookieScanQueue } from "../../constructs/Sqs/CookieScanQueue";
import { CookieScannerFunction } from "../../constructs/Lambda/CookieScannerFunction";
import { EventConnectionResource } from "../../constructs/EventBridge/EventConnectionResource";
import { ApiDestinationResource } from "../../constructs/EventBridge/ApiDestinationResource";
import { EventBusResource } from "../../constructs/EventBridge/EventBusResource";
import { EventRuleResource } from "../../constructs/EventBridge/EventRuleResource";
import { EnvironmentResource } from "../../constructs/Platform/EnvironmentResource";

interface CookieScannerStackProps extends StackProps {
    environmentVariables: EnvironmentResource;
    idPrefix: string;
}

export class CookieScannerSetupStack extends Stack {
    constructor(scope: Construct, id: string, props: CookieScannerStackProps) {
        super(scope, id, props);

        const environmentVariables = props.environmentVariables.getEnvironmentVars();

        const { idPrefix } = props;
        const queue = new CookieScanQueue(this, `${idPrefix}CookieScannerQueue`, {
            queueName: environmentVariables.SCANNER_QUEUE_NAME,
        });

        const eventBus = new EventBusResource(this, `${idPrefix}CookiesScannedEventBus`, {
            busName: environmentVariables.SCANNER_EVENT_BRIDGE_EVENT_BUS_NAME,
        });

        const connection = new EventConnectionResource(this, `${idPrefix}CookiesConnectionResource`, {
            apiKey: environmentVariables.SCANNER_WEBHOOK_SEND_API_KEY,
            connectionName: environmentVariables.SCANNER_EVENT_BRIDGE_CONNECTION_NAME,
        });

        const apiDestination = new ApiDestinationResource(this, `${idPrefix}CookiesDestination`, {
            connection,
            endpoint: environmentVariables.SCANNER_WEBHOOK_POST_ENDPOINT,
        });

        const lambdaFunction = new CookieScannerFunction(this, `${idPrefix}CookiesLambdaFunction`, {
            bus: environmentVariables.SCANNER_EVENT_BRIDGE_EVENT_BUS_NAME,
            eventDetail: environmentVariables.SCANNER_EVENT_BRIDGE_EVENT_DETAIL_TYPE,
            eventSource: environmentVariables.SCANNER_EVENT_BRIDGE_EVENT_SOURCE_NAME,
        });

        lambdaFunction.addEventSource(
            new lambdaEventSources.SqsEventSource(queue, {
                batchSize: 1,
                enabled: true,
            }),
        );

        eventBus.grantPutEventsTo(lambdaFunction);

        new EventRuleResource(this, `${idPrefix}CookiesRuleResource`, {
            apiDestination,
            eventBus,
            eventDetailType: environmentVariables.SCANNER_EVENT_BRIDGE_EVENT_DETAIL_TYPE,
            eventSourceName: environmentVariables.SCANNER_EVENT_BRIDGE_EVENT_SOURCE_NAME,
        });
    }
}
