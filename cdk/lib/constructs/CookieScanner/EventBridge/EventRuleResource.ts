import {Duration} from "aws-cdk-lib"
import {Architecture, DockerImageCode, DockerImageFunction } from "aws-cdk-lib/aws-lambda"
import {Construct} from "constructs"
import {Platform} from "aws-cdk-lib/aws-ecr-assets";
import {fromRoot} from "../../../helpers";
import {ApiDestination, EventBus, Rule} from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";


type CookieScannerLambdaContainerProps = {
    eventBus: EventBus,
    eventSourceName: string
    eventDetailType: string
    apiDestination: ApiDestination
}

export class EventRuleResource extends Rule {
    constructor(scope: Construct, id: string, props: CookieScannerLambdaContainerProps) {
        const {eventBus, eventSourceName, eventDetailType, apiDestination} = props;

        const baseProps = {
            eventBus,
            ruleName: 'CookieScannerToBackend',
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
        }
        super(scope, id, baseProps);
    }
}
