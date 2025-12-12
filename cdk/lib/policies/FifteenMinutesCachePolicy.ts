import * as cdk from "aws-cdk-lib";
import { CachePolicy, CacheHeaderBehavior, CacheCookieBehavior, CacheQueryStringBehavior } from "aws-cdk-lib/aws-cloudfront";

export const fifteenMinPolicy = (stack: cdk.Stack) => {
    return new CachePolicy(stack, "FifteenMinPolicy", {
        cachePolicyName: "FifteenMinPolicy",
        defaultTtl: cdk.Duration.minutes(15),
        maxTtl: cdk.Duration.minutes(15),
        minTtl: cdk.Duration.minutes(0),
        headerBehavior: CacheHeaderBehavior.none(),
        cookieBehavior: CacheCookieBehavior.none(),
        queryStringBehavior: CacheQueryStringBehavior.allowList("v"),
        enableAcceptEncodingBrotli: true,
        enableAcceptEncodingGzip: true,
    });
};

export const bannerComponentCachePolicy = (stack: cdk.Stack) => {
    return new CachePolicy(stack, "BannerComponentCachePolicy", {
        cachePolicyName: "BannerComponentCachePolicy",
        defaultTtl: cdk.Duration.minutes(15),
        maxTtl: cdk.Duration.minutes(15),
        minTtl: cdk.Duration.minutes(0),
        headerBehavior: CacheHeaderBehavior.none(),
        cookieBehavior: CacheCookieBehavior.none(),
        queryStringBehavior: CacheQueryStringBehavior.allowList("v"),
        enableAcceptEncodingBrotli: true,
        enableAcceptEncodingGzip: true,
    });
};
