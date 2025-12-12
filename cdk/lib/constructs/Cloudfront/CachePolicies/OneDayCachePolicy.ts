import { Construct } from "constructs";
import { CacheCookieBehavior, CacheHeaderBehavior, CachePolicy, CacheQueryStringBehavior } from "aws-cdk-lib/aws-cloudfront";
import { Duration } from "aws-cdk-lib";

export class OneDayCachePolicy extends CachePolicy {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      cachePolicyName: "OneDayCache",
      comment: "Cache responses for 1 day, bustable via ?v=",
      defaultTtl: Duration.days(1),
      minTtl: Duration.days(1),
      maxTtl: Duration.days(1),
      cookieBehavior: CacheCookieBehavior.none(),
      headerBehavior: CacheHeaderBehavior.none(),
      queryStringBehavior: CacheQueryStringBehavior.allowList("v"),
    });
  }
}
