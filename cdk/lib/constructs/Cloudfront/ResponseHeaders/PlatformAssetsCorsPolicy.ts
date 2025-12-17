import {ResponseHeadersPolicy} from "aws-cdk-lib/aws-cloudfront";
import {Construct} from "constructs";
import {Duration} from "aws-cdk-lib/core";

export class PlatformAssetsCorsPolicy extends ResponseHeadersPolicy {

    constructor(scope: Construct, id: string) {

        super(scope, id, {
            comment: "CORS for platform assets (js/css) served via CloudFront",
            corsBehavior: {
                accessControlAllowCredentials: false,
                accessControlAllowHeaders: ["*"],
                accessControlAllowMethods: ["GET", "HEAD", "OPTIONS"],
                accessControlAllowOrigins: ["*"], // of ["https://platform.cookieconfirm.tech"]
                accessControlExposeHeaders: ["*"],
                accessControlMaxAge: Duration.hours(24),
                originOverride: true, // belangrijk: CloudFront overschrijft origin headers
            },
        });
    }
}