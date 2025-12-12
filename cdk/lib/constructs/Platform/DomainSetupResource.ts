import { Construct } from "constructs";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget, LoadBalancerTarget } from "aws-cdk-lib/aws-route53-targets";
import { ApplicationLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { ApplicationType } from "../../types/ApplicationType";
import { CfnOutput } from "aws-cdk-lib";
import { Distribution } from "aws-cdk-lib/aws-cloudfront";

type DomainProps = {
  loadBalancer: ApplicationLoadBalancer;
  stage: ApplicationType;
  cloudfrontDistribution: Distribution;
  prefix: string;
  region: string;
};

export class DomainResource extends Construct {
  constructor(scope: Construct, id: string, props: DomainProps) {
    super(scope, id);

    const { loadBalancer, cloudfrontDistribution, prefix, region } = props;

    const appMainDomain = StringParameter.valueFromLookup(this, `/${prefix}/APP_MAIN_DOMAIN`);

    const appSubDomain = StringParameter.valueFromLookup(this, `/${prefix}/APP_SUBDOMAIN`);

    const assetsSubDomain = StringParameter.valueFromLookup(this, `/${prefix}/APP_PLATFORM_ASSETS_SUBDOMAIN`);

    const hostedZone = HostedZone.fromLookup(this, "HostedZone", {
      domainName: appMainDomain,
    });

    new CfnOutput(scope, `SampleOutputHostedZone`, {
      value: hostedZone.zoneName,
    });

    new CfnOutput(scope, `SampleOutputHostedZoneEnv`, {
      value: region,
    });

    new ARecord(this, "PlatformARecordViaLoadBalancer", {
      region,
      zone: hostedZone,
      recordName: appSubDomain,
      target: RecordTarget.fromAlias(new LoadBalancerTarget(loadBalancer)),
    });

    new ARecord(this, "CloudfrontDistributionPlatformARecordViaLoadBalancer", {
      region,
      zone: hostedZone,
      recordName: assetsSubDomain,
      target: RecordTarget.fromAlias(new CloudFrontTarget(cloudfrontDistribution)),
    });

    new CfnOutput(scope, `SampleOutputSubdomain`, {
      value: appSubDomain,
    });

    new CfnOutput(scope, `SampleOutputDomain`, {
      value: appMainDomain,
    });
  }
}
