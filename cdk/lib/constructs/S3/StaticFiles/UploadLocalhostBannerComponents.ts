import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import { Distribution } from "aws-cdk-lib/aws-cloudfront";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, CacheControl, Source } from "aws-cdk-lib/aws-s3-deployment";
import { fromRoot } from "../../../helpers";

type UploadBannerResourceProps = {
  distribution: Distribution;
  destinationBucket: Bucket;
};

export class UploadLocalhostBannerComponents extends BucketDeployment {
  constructor(scope: Construct, id: string, props: UploadBannerResourceProps) {
    const { distribution, destinationBucket } = props;

    super(scope, id, {
      prune: false,
      destinationKeyPrefix: "banner",
      sources: [Source.asset(fromRoot("banner", "development", "data-sources"))],
      destinationBucket,
      distribution,
      distributionPaths: ["/*"],
      cacheControl: [CacheControl.maxAge(cdk.Duration.minutes(15)), CacheControl.setPublic()],
    });
  }
}
