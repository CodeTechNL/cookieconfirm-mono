import {Stack, StackProps} from "aws-cdk-lib"
import {Construct} from "constructs"
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import {CookieScanRequestSqsResource} from "../constructs/CookieScanner/Sqs/CookieScanRequestSqsResource";
import {CookieScannerLambdaContainerResource} from "../constructs/CookieScanner/Lambda/CookieScannerLambdaContainerResource";
import {EventConnectionResource} from "../constructs/CookieScanner/EventBridge/EventConnectionResource";
import {ApiDestinationResource} from "../constructs/CookieScanner/EventBridge/ApiDestinationResource";
import {EventBusResource} from "../constructs/CookieScanner/EventBridge/EventBusResource";
import {EventRuleResource} from "../constructs/CookieScanner/EventBridge/EventRuleResource";

interface CookieScannerStackProps extends StackProps {
    busName: string
    eventSourceName: string
    eventDetailType: string
    apiKey: string
    connectionName: string
    endpoint: string
    queueName: string
}

/**
 * - Queue
 * - Lambda
 * - Event Bus
 * - Event Connection
 * - Event API Destination
 */
export class CookieScannerStack extends Stack {
    constructor(scope: Construct, id: string, props: CookieScannerStackProps) {
        super(scope, id, props)

        const {busName, eventSourceName, eventDetailType, apiKey, connectionName, endpoint, queueName} = props;

        const queue = new CookieScanRequestSqsResource(this, 'CookieScannerQueue', {
            queueName
        })

        const eventBus = new EventBusResource(this, 'CookiesScannedEventBus', {
            busName,
        })

        const connection = new EventConnectionResource(this, 'CookiesConnectionResource', {
            apiKey,
            connectionName,
        });

        const apiDestination = new ApiDestinationResource(this, 'CookiesDestination', {
            connection,
            endpoint,
        })

        const lambdaFunction = new CookieScannerLambdaContainerResource(this, 'CookiesLambdaFunction', {
            bus: busName,
            eventDetail: eventDetailType,
            eventSource: eventSourceName
        })

        lambdaFunction.addEventSource(
            new lambdaEventSources.SqsEventSource(queue, {
                batchSize: 1,
                enabled: true,
            }),
        );

        eventBus.grantPutEventsTo(lambdaFunction)

        new EventRuleResource(this, 'CookiesRuleResource', {
            apiDestination,
            eventBus,
            eventDetailType,
            eventSourceName
        })
    }
}
