import { Construct } from "constructs";
import { CacheCookieBehavior, CacheHeaderBehavior, CachePolicy, CacheQueryStringBehavior } from "aws-cdk-lib/aws-cloudfront";
import { Duration } from "aws-cdk-lib";

export class OneYearCachePolicy extends CachePolicy {
    constructor(scope: Construct, id: string) {
        super(scope, id, {
            cachePolicyName: "OneYearCache",
            comment: "Cache responses for 1 year, bustable via ?v=",
            defaultTtl: Duration.days(365),
            minTtl: Duration.days(365),
            maxTtl: Duration.days(365),
            cookieBehavior: CacheCookieBehavior.none(),
            headerBehavior: CacheHeaderBehavior.none(),
            queryStringBehavior: CacheQueryStringBehavior.allowList("v"),
        });
    }
}
