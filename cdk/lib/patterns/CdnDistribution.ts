import {Construct} from "constructs";
import {IOrigin} from "aws-cdk-lib/aws-cloudfront";
import {Certificate} from "aws-cdk-lib/aws-certificatemanager";
import {CloudfrontDistribution} from "../constructs/Cloudfront/CloudfrontDistribution";

type AssetsDistributionResourceProps = {
    origin: IOrigin
    certificateArn: string
    domainNames: string[]
}

export class CdnDistribution extends Construct {
    private readonly cloudfrontDistribution: CloudfrontDistribution;

    constructor(scope: Construct, id: string, props: AssetsDistributionResourceProps) {
        super(scope, id);

        const {origin, certificateArn, domainNames} = props;

        this.cloudfrontDistribution = new CloudfrontDistribution(this, 'SiteDistribution', {
            certificate: Certificate.fromCertificateArn(
                this,
                "Certificate",
                certificateArn
            ),
            domainNames,
            origin
        })
    }

    public getCloudfrontDistribution(): CloudfrontDistribution {
        return this.cloudfrontDistribution;
    }
}
