import {Construct} from "constructs";
import * as cdk from "aws-cdk-lib";
import {Distribution} from "aws-cdk-lib/aws-cloudfront";
import {Bucket} from "aws-cdk-lib/aws-s3";
import {BucketDeployment, CacheControl, Source} from "aws-cdk-lib/aws-s3-deployment";
import {fromRoot} from "../../../../path-helpers";

type UploadBannerResourceProps = {
    cloudfront: Distribution
    bucket:  Bucket
}

export class UploadBannerResource extends Construct {
    private readonly resource: BucketDeployment;

    constructor(scope: Construct, id: string, props: UploadBannerResourceProps) {
        super(scope, id);

        const {cloudfront, bucket} = props;

        this.resource = new BucketDeployment(this, "DeployBannerAssets", {
            prune: false,
            sources: [
                Source.asset(fromRoot("banner", 'dist')),
                Source.asset(fromRoot("banner", 'public'),{

                }),
            ],
            destinationBucket: bucket,
            distribution: cloudfront,
            distributionPaths: ["/*"],
            cacheControl: [
                CacheControl.maxAge(cdk.Duration.minutes(15)),
                CacheControl.setPublic(),
            ],
        })
    }

    public getResource(): BucketDeployment {
        return this.resource;
    }
}
