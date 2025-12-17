import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import { Distribution } from "aws-cdk-lib/aws-cloudfront";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, CacheControl, Source } from "aws-cdk-lib/aws-s3-deployment";
import { fromRoot } from "../../../helpers";
import * as path from "node:path";
import {DockerImage} from "aws-cdk-lib";
import {StringParameter} from "aws-cdk-lib/aws-ssm";

type UploadBannerResourceProps = {
    distribution: Distribution;
    destinationBucket: Bucket;
    viteConfig: {
        VITE_APP_URL: string
        VITE_CDN_URL: string
    }
};

export class UploadBannerScripts extends BucketDeployment {
    constructor(scope: Construct, id: string, props: UploadBannerResourceProps) {
        const { distribution, destinationBucket, viteConfig } = props;

        const d = fromRoot("banner")



        super(scope, id, {
            destinationBucket,
            distribution,
            prune: false,
            distributionPaths: ["/*"],
            cacheControl: [
                CacheControl.maxAge(cdk.Duration.minutes(15)),
                CacheControl.setPublic()
            ],
            sources: [
                Source.asset(d, {
                    bundling: {
                        user: "0:0",
                        image: DockerImage.fromRegistry("node:20-bullseye"),
                        environment: viteConfig,
                        command: [
                            "bash", "-lc",
                            [
                                "set -euxo pipefail",
                                "cd /asset-input",
                                "npm ci",
                                "npm run build",
                                "cp -r dist/* /asset-output/",
                            ].join(" && "),
                        ],
                    },
                }),
            ],
        })
        //
        // super(scope, id, {
        //     prune: false,
        //     sources: [Source.asset(fromRoot("banner", "dist")), Source.asset(fromRoot("banner", "public"))],
        //     destinationBucket,
        //     distribution,
        //     distributionPaths: ["/*"],
        //     cacheControl: [
        //         CacheControl.maxAge(cdk.Duration.minutes(15)),
        //         CacheControl.setPublic()
        //     ],
        // });
    }
}
