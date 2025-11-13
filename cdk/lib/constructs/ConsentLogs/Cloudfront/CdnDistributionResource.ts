import {Construct} from "constructs";
import {
    AllowedMethods, CachePolicy, CfnFunction,
    Distribution, FunctionCode, FunctionEventType, IOrigin, OriginProtocolPolicy,
    OriginRequestHeaderBehavior, OriginRequestPolicy,
    PriceClass, ResponseHeadersPolicy,
    SecurityPolicyProtocol,
    ViewerProtocolPolicy, Function as CfFunction
} from "aws-cdk-lib/aws-cloudfront";
import * as cdk from "aws-cdk-lib";
import {HttpOrigin} from "aws-cdk-lib/aws-cloudfront-origins";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import {Fn} from "aws-cdk-lib";
import {FunctionUrl} from "aws-cdk-lib/aws-lambda";
import {fromRoot} from "../../../path-helpers";
import {Certificate} from "aws-cdk-lib/aws-certificatemanager";

type AssetsDistributionResourceProps = {
    origin: IOrigin
    certificateArn: string
}

export class CdnDistributionResource extends Construct {
    private readonly resource: Distribution;

    constructor(scope: Construct, id: string, props: AssetsDistributionResourceProps) {
        super(scope, id);

        const {origin, certificateArn} = props;

        this.resource = new Distribution(this, "SiteDistribution", {
            comment: "CDN for serving banner assets",
            defaultRootObject: "index.html",
            minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
            priceClass: PriceClass.PRICE_CLASS_100,
            domainNames: [
                'banner.cookieconfirm.com'
            ],
            certificate: Certificate.fromCertificateArn(
                this,
                "Certificate",
                certificateArn
            ),
            defaultBehavior: {
                cachePolicy: CachePolicy.CACHING_DISABLED,
                origin: origin,
                compress: true,
                allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
        });

        new cdk.CfnOutput(this, "CloudFrontDomain", { value: this.getResource().domainName })
    }

    public addInitJsonBehavior(origin: IOrigin, cachePolicy: CachePolicy): this {

        const countryHeaderPolicy = new OriginRequestPolicy(this, 'CountryHeaderPolicy', {
            originRequestPolicyName: 'IncludeCountryHeader',
            comment: 'Send CloudFront-Viewer-Country header to origin',
            headerBehavior: OriginRequestHeaderBehavior.allowList('CloudFront-Viewer-Country'),
        });

        this.getResource().addBehavior('/banner/*/init.json', origin, {
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
            cachePolicy: cachePolicy,
            originRequestPolicy: countryHeaderPolicy,
            compress: true,
            functionAssociations: [
                {
                    eventType: FunctionEventType.VIEWER_RESPONSE,
                    function: this.getCountryExposeHeader()
                },
            ],
        })

        return this;
    }

    private getCountryExposeHeader(): CfFunction {
        return new CfFunction(this, 'ExposeCountryHeaderFn', {
            code: FunctionCode.fromFile({
                filePath: fromRoot('cdk', 'lib', 'cloudfront','functions','viewer-country.ts')
            }),
        });
    }

    public addBannerComponentsBehavior(origin: IOrigin, cachePolicy: CachePolicy): this {
        this.getResource().addBehavior('/banner/*', origin, {
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
            cachePolicy: cachePolicy,
            compress: true,
        })

        return this;
    }

    addConsentStorageBehavior(url: string){
        this.getResource().addBehavior("/api/v1/store-consent", new HttpOrigin(url, {
            protocolPolicy: OriginProtocolPolicy.HTTPS_ONLY,
        }), {
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            allowedMethods: AllowedMethods.ALLOW_ALL,
            cachePolicy: CachePolicy.CACHING_DISABLED,
            // BELANGRIJK: Host NIET doorsturen naar de Function URL
            originRequestPolicy: OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
            // (optioneel) CloudFront Function of Lambda@Edge hieronder
        });
        return this;
    }

    public getResource(): Distribution {
        return this.resource;
    }
}
