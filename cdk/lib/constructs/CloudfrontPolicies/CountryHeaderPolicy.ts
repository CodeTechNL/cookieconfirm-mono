import { Construct } from "constructs";
import { OriginRequestHeaderBehavior, OriginRequestPolicy } from "aws-cdk-lib/aws-cloudfront";

export class CountryHeaderPolicy extends OriginRequestPolicy {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      originRequestPolicyName: "IncludeCountryHeader",
      comment: "Send CloudFront-Viewer-Country header to origin",
      headerBehavior: OriginRequestHeaderBehavior.allowList("CloudFront-Viewer-Country"),
    });
  }
}
