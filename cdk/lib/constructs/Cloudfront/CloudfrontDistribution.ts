import { Construct } from "constructs";
import {
    AllowedMethods,
    CachePolicy,
    Distribution,
    FunctionCode,
    FunctionEventType,
    IOrigin,
    OriginProtocolPolicy,
    OriginRequestPolicy,
    PriceClass,
    SecurityPolicyProtocol,
    ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { CountryHeaderPolicy } from "../CloudfrontPolicies/CountryHeaderPolicy";
import { Function as CfFunction } from "aws-cdk-lib/aws-cloudfront";
import { fromRoot } from "../../helpers";
import { HttpOrigin } from "aws-cdk-lib/aws-cloudfront-origins";

type AssetsDistributionResourceProps = {
    origin: IOrigin;
    domainNames: string[];
    certificate: ICertificate;
};

export class CloudfrontDistribution extends Distribution {
    constructor(scope: Construct, id: string, props: AssetsDistributionResourceProps) {
        const { origin, certificate, domainNames } = props;

        super(scope, id, {
            comment: "CDN for serving banner assets",
            defaultRootObject: "index.html",
            minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
            priceClass: PriceClass.PRICE_CLASS_100,
            domainNames,
            certificate,
            defaultBehavior: {
                cachePolicy: CachePolicy.CACHING_DISABLED,
                origin: origin,
                compress: true,
                allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
        });
    }

    public addInitJsonBehavior(path: string, origin: IOrigin, cachePolicy: CachePolicy): this {
        const countryHeaderPolicy = new CountryHeaderPolicy(this, `CountryHeaderPolicy`);

        this.addBehavior(path, origin, {
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
            cachePolicy: cachePolicy,
            originRequestPolicy: countryHeaderPolicy,
            compress: true,
            functionAssociations: [
                {
                    eventType: FunctionEventType.VIEWER_RESPONSE,
                    function: this.getCountryExposeHeader(),
                },
            ],
        });

        return this;
    }

    private getCountryExposeHeader(): CfFunction {
        return new CfFunction(this, "ExposeCountryHeaderFn", {
            code: FunctionCode.fromFile({
                filePath: fromRoot("cdk", "lib", "cloudfront", "functions", "viewer-country.ts"),
            }),
        });
    }

    public addDefaultBehavior(path: string, origin: IOrigin, cachePolicy: CachePolicy) {
        this.addBehavior(path, origin, {
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
            cachePolicy: cachePolicy,
            compress: true,
        });

        return this;
    }

    addConsentStorageBehavior(path: string, url: string) {
        this.addBehavior(
            path,
            new HttpOrigin(url, {
                protocolPolicy: OriginProtocolPolicy.HTTPS_ONLY,
            }),
            {
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                allowedMethods: AllowedMethods.ALLOW_ALL,
                cachePolicy: CachePolicy.CACHING_DISABLED,
                originRequestPolicy: OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
            },
        );
        return this;
    }
}
