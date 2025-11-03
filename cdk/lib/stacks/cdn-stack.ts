import * as cdk from "aws-cdk-lib"
import { Construct } from "constructs"
import {OriginAccessIdentity} from "aws-cdk-lib/aws-cloudfront"
import { BucketDeployment, CacheControl, Source } from "aws-cdk-lib/aws-s3-deployment"
import { fifteenMinPolicy } from "../policies/FifteenMinutesCachePolicy"
import { fromRoot } from "../path-helpers"

import {S3BucketResource} from "../constructs/S3BucketResource";
import {CloudFrontResource} from "../constructs/CloudFrontResource";


export class CdnStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        const bucket = new S3BucketResource(this, "SiteBucket", {
            bucketName: 'cdk-cookie-confirm',
        }).bucket;

        const oai = new OriginAccessIdentity(this, "OAI")
        bucket.grantRead(oai)

        const cachePolicy = fifteenMinPolicy(this) // jouw 15-min policy (bijv. allowList('v'))

        const cloudfront = new CloudFrontResource(this, 'SiteDistribution', {
            bucket: bucket,
            cachePolicy: cachePolicy,
        })

        new BucketDeployment(this, "DeployAllFiles", {
            sources: [
                Source.asset(fromRoot("banner", 'dist')),
                Source.asset(fromRoot("banner", 'public'))
            ],
            destinationBucket: bucket,
            distribution: cloudfront.cloudFront,
            distributionPaths: ["/*"],
            cacheControl: [
                CacheControl.maxAge(cdk.Duration.minutes(15)),
                CacheControl.setPublic(),
            ],
        })

        new cdk.CfnOutput(this, "BucketName", { value: bucket.bucketName })
        new cdk.CfnOutput(this, "CloudFrontDomain", { value: cloudfront.cloudFront.domainName })
    }
}
