import {Construct} from "constructs";
import {
    AllowedMethods, CachePolicy,
    CfnFunction,
    Distribution,
    IOrigin,
    OriginProps,
    SecurityPolicyProtocol, ViewerProtocolPolicy
} from "aws-cdk-lib/aws-cloudfront";
import {
    Stack,
    StackProps,
    Duration,
    RemovalPolicy,
    CfnOutput,
    aws_s3 as s3,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins,
    aws_s3_deployment as s3deploy,
} from 'aws-cdk-lib';

import {Bucket} from "aws-cdk-lib/aws-s3";
import {S3BucketOrigin} from "aws-cdk-lib/aws-cloudfront-origins";

type CloudFrontProps = {
    bucket: Bucket,
    cachePolicy: CachePolicy
}
export class CloudFrontResource extends Construct {
    public cloudFront: Distribution;

    constructor(scope: Construct, id: string, props: CloudFrontProps) {
        super(scope, id);

        const errorResponse = (httpStatus: number) => {
            return  {
                httpStatus: httpStatus,
                responseHttpStatus: 404,
                responsePagePath: '/404.html',
                ttl: Duration.minutes(30),
            };
        };

        this.cloudFront = new Distribution(this, "SiteDistribution", {
            defaultRootObject: "index.html",
            minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
            errorResponses:[
                errorResponse(403),
                errorResponse(404),
            ],
            defaultBehavior: {
                origin: S3BucketOrigin.withOriginAccessControl(props.bucket),
                compress: true,
                allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cachePolicy: props.cachePolicy
            }
        })
    }
}