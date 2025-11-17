import {Construct} from "constructs"
import {EventBus} from "aws-cdk-lib/aws-events";


type EventBusProps = {
    busName: string
}

export class EventBusResource extends EventBus {
    constructor(scope: Construct, id: string, props: EventBusProps) {

        const baseProps = {
            eventBusName: props.busName,
        };

        super(scope, id, baseProps);
    }
}
