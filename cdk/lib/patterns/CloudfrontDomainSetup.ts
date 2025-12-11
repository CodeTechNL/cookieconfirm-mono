import {Construct} from "constructs";
import {ARecord, HostedZone, RecordTarget} from "aws-cdk-lib/aws-route53";
import {CloudFrontTarget} from "aws-cdk-lib/aws-route53-targets";
import {Distribution} from "aws-cdk-lib/aws-cloudfront";

type CloudfrontDomainSetupProps = {
    distribution: Distribution
    hostedZoneDomain: string
    recordName: string
}

export class CloudfrontDomainSetup extends Construct {
    constructor(scope: Construct, id: string, props: CloudfrontDomainSetupProps) {
        super(scope, id);

        const {hostedZoneDomain, distribution, recordName} = props;

        const zone = HostedZone.fromLookup(this, "HostedZone", {
            domainName: hostedZoneDomain,
        });

        new ARecord(this, "BannerSubdomainRecord", {
            zone,
            recordName,
            target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
        });
    }
}
