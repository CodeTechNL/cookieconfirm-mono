import { Construct } from "constructs";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget, LoadBalancerTarget } from "aws-cdk-lib/aws-route53-targets";
import { ApplicationLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { ApplicationType } from "../../types/ApplicationType";
import { CfnOutput } from "aws-cdk-lib";
import { Distribution } from "aws-cdk-lib/aws-cloudfront";
import {EnvironmentResource} from "./EnvironmentResource";

type DomainProps = {
    loadBalancer: ApplicationLoadBalancer;
    stage: ApplicationType;
    cloudfrontDistribution: Distribution;
    idPrefix: string;
    region: string;
    environmentResource: EnvironmentResource
};

export class DomainResource extends Construct {
    constructor(scope: Construct, id: string, props: DomainProps) {
        super(scope, id);

        const { loadBalancer, cloudfrontDistribution, idPrefix, region, environmentResource } = props;

        const config = environmentResource.getEnvironmentVars();

        const hostedZone = HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
            hostedZoneId: config.HOSTED_ZONE_ID,
            zoneName: config.APP_MAIN_DOMAIN,
        });

        new CfnOutput(scope, `${idPrefix}SampleOutputHostedZone`, {
            value: hostedZone.zoneName,
        });

        new CfnOutput(scope, `${idPrefix}SampleOutputHostedZoneEnv`, {
            value: region,
        });

        new ARecord(this, `${idPrefix}PlatformARecordViaLoadBalancer`, {
            region,
            zone: hostedZone,
            recordName: config.APP_SUBDOMAIN,
            target: RecordTarget.fromAlias(new LoadBalancerTarget(loadBalancer)),
        });

        new ARecord(this, `${idPrefix}CloudfrontDistributionPlatformARecordViaLoadBalancer`, {
            region,
            zone: hostedZone,
            recordName: config.APP_PLATFORM_ASSETS_SUBDOMAIN,
            target: RecordTarget.fromAlias(new CloudFrontTarget(cloudfrontDistribution)),
        });

        new CfnOutput(scope, `${idPrefix}SampleOutputSubdomain`, {
            value: config.APP_SUBDOMAIN,
        });

        new CfnOutput(scope, `${idPrefix}SampleOutputDomain`, {
            value: config.APP_MAIN_DOMAIN,
        });
    }
}
