import {Construct} from "constructs";
import * as cdk from "aws-cdk-lib";
import {Distribution} from "aws-cdk-lib/aws-cloudfront";
import {Bucket} from "aws-cdk-lib/aws-s3";
import {BucketDeployment, CacheControl, Source} from "aws-cdk-lib/aws-s3-deployment";
import {fromRoot} from "../../../helpers";

type UploadBannerResourceProps = {
    distribution: Distribution
    destinationBucket:  Bucket
}

export class UploadBannerScripts extends BucketDeployment {
    constructor(scope: Construct, id: string, props: UploadBannerResourceProps) {

        const {distribution, destinationBucket} = props;

        super(scope, id, {
            prune: false,
            sources: [
                Source.asset(fromRoot("banner", 'dist')),
                Source.asset(fromRoot("banner", 'public')),
            ],
            destinationBucket,
            distribution,
            distributionPaths: ["/*"],
            cacheControl: [
                CacheControl.maxAge(cdk.Duration.minutes(15)),
                CacheControl.setPublic(),
            ],
        });
    }
}
