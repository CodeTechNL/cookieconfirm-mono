import { Construct } from "constructs";
import { CacheCookieBehavior, CacheHeaderBehavior, CachePolicy, CacheQueryStringBehavior } from "aws-cdk-lib/aws-cloudfront";
import { Duration } from "aws-cdk-lib";

export class FifteenMinutesCachePolicy extends CachePolicy {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      cachePolicyName: "FifteenMinuteCache",
      comment: "Cache responses for 15 minutes, bustable via ?v=",
      defaultTtl: Duration.minutes(15),
      minTtl: Duration.minutes(15),
      maxTtl: Duration.minutes(15),
      cookieBehavior: CacheCookieBehavior.none(),
      headerBehavior: CacheHeaderBehavior.none(),
      queryStringBehavior: CacheQueryStringBehavior.allowList("v"),
    });
  }
}
