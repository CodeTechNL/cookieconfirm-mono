import {Stack, StackProps, Environment, CfnOutput} from "aws-cdk-lib";
import { Construct } from "constructs";
import {CookieScanQueue} from "../constructs/Sqs/CookieScanQueue";
import {EventBusResource} from "../constructs/EventBridge/EventBusResource";
import {EventConnectionResource} from "../constructs/EventBridge/EventConnectionResource";
import {ApiDestinationResource} from "../constructs/EventBridge/ApiDestinationResource";
import {CookieScannerFunction} from "../constructs/Lambda/CookieScannerFunction";
import {EventRuleResource} from "../constructs/EventBridge/EventRuleResource";
import {EnvironmentVariables} from "../patterns/EnvironmentVariables";
import {SqsEventSource} from "aws-cdk-lib/aws-lambda-event-sources";

interface PlatformAssetsStackProps extends StackProps {
    env: Environment;
    idPrefix: string;
    resourcePrefix: string
}

export class CookieScannerStack extends Stack {
    constructor(scope: Construct, id: string, props: PlatformAssetsStackProps) {
        super(scope, id, props);

        const { idPrefix, resourcePrefix, env } = props;

        const environmentVariables = new EnvironmentVariables(this, `${idPrefix}EnvironmentVariables`, {
            env,
            idPrefix,
            resourcePrefix
        })

        const config = environmentVariables.getEnvironmentResource().getEnvironmentVars()

        const queue = new CookieScanQueue(this, `${idPrefix}CookieScannerQueue`, {
            queueName: config.SCANNER_QUEUE_NAME,
        });

        new CfnOutput(this, `${idPrefix}CookieScannerQueueUrl`, {
            value: queue.queueUrl
        })
        const eventBus = new EventBusResource(this, `${idPrefix}CookiesScannedEventBus`, {
            busName: config.SCANNER_EVENT_BRIDGE_EVENT_BUS_NAME,
        });

        const connection = new EventConnectionResource(this, `${idPrefix}CookiesConnectionResource`, {
            apiKey: config.LAMBDA_WEBHOOKS_SECRET,
            connectionName: config.SCANNER_EVENT_BRIDGE_CONNECTION_NAME,
        });

        const apiDestination = new ApiDestinationResource(this, `${idPrefix}CookiesDestination`, {
            connection,
            endpoint: config.WEBHOOKS_COOKIE_SCANNER_RESULTS_ENDPOINT,
        });

        const lambdaFunction = new CookieScannerFunction(this, `${idPrefix}CookiesLambdaFunction`, {
            bus: config.SCANNER_EVENT_BRIDGE_EVENT_BUS_NAME,
            eventDetail: config.SCANNER_EVENT_BRIDGE_EVENT_DETAIL_TYPE,
            eventSource: config.SCANNER_EVENT_BRIDGE_EVENT_SOURCE_NAME,
        });

        lambdaFunction.addEventSource(
            new SqsEventSource(queue, {
                batchSize: 1,
                enabled: true,
            }),
        );

        eventBus.grantPutEventsTo(lambdaFunction);

        new EventRuleResource(this, `${idPrefix}CookiesRuleResource`, {
            apiDestination,
            eventBus,
            eventDetailType: config.SCANNER_EVENT_BRIDGE_EVENT_DETAIL_TYPE,
            eventSourceName: config.SCANNER_EVENT_BRIDGE_EVENT_SOURCE_NAME,
        });
    }
}
