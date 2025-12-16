import { Stack, StackProps } from "aws-cdk-lib/core";
import { Construct } from "constructs";
import {InterfaceVpcEndpointAwsService} from "aws-cdk-lib/aws-ec2";
import {MeilisearchVpc} from "../constructs/Vpc/MeilisearchVpc";
import {MeilisearchService} from "../patterns/MeilisearchService";
import {EnvironmentVariables} from "../patterns/EnvironmentVariables";
import {Environment} from "aws-cdk-lib";


interface MeilisearchStackProps extends StackProps {
    idPrefix: string;
    resourcePrefix: string;
    env: Environment
}

export class MeilisearchStack extends Stack {
    constructor(scope: Construct, id: string, props: MeilisearchStackProps) {
        super(scope, id, props);

        const {resourcePrefix, idPrefix, env} = props;

        const environmentVariables = new EnvironmentVariables(this, `${idPrefix}EnvironmentVariables`, {
            env,
            idPrefix,
            resourcePrefix
        })

        const vpc = new MeilisearchVpc(this, `${idPrefix}MeilisearchVpc`, {
            resourcePrefix
        })

        // // Needed for Lambda to pull the container image + write logs without NAT
        // vpc.addInterfaceEndpoint("EcrApiEndpoint", {
        //     service: InterfaceVpcEndpointAwsService.ECR,
        // });
        // vpc.addInterfaceEndpoint("EcrDkrEndpoint", {
        //     service: InterfaceVpcEndpointAwsService.ECR_DOCKER,
        // });

        vpc.addInterfaceEndpoint("CloudWatchLogsEndpoint", {
            service: InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
        });

        new MeilisearchService(this, `${idPrefix}MeilisearchService`, {
            idPrefix,
            resourcePrefix,
            vpc,
            environmentVariables: environmentVariables.getEnvironmentResource().getEnvironmentVars(),
        })
    }

}
