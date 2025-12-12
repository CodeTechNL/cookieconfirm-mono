import { Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ApiDestination, EventBus, Rule } from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";

type CookieScannerLambdaContainerProps = {
    eventBus: EventBus;
    eventSourceName: string;
    eventDetailType: string;
    apiDestination: ApiDestination;
};

export class EventRuleResource extends Rule {
    constructor(scope: Construct, id: string, props: CookieScannerLambdaContainerProps) {
        const { eventBus, eventSourceName, eventDetailType, apiDestination } = props;

        super(scope, id, {
            eventBus,
            ruleName: "CookieScannerToBackend",
            eventPattern: {
                source: [eventSourceName],
                detailType: [eventDetailType],
            },
            targets: [
                new targets.ApiDestination(apiDestination, {
                    retryAttempts: 2,
                    maxEventAge: Duration.minutes(15),
                }),
            ],
        });
    }
}
