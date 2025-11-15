import {Construct} from "constructs";
import {
    AllowedMethods, CachePolicy,
    Distribution, FunctionCode, FunctionEventType, IOrigin, OriginProtocolPolicy,
    OriginRequestHeaderBehavior, OriginRequestPolicy,
    PriceClass,
    SecurityPolicyProtocol,
    ViewerProtocolPolicy, Function as CfFunction
} from "aws-cdk-lib/aws-cloudfront";
import * as cdk from "aws-cdk-lib";
import {HttpOrigin} from "aws-cdk-lib/aws-cloudfront-origins";
import {fromRoot} from "../../../helpers";
import {Certificate} from "aws-cdk-lib/aws-certificatemanager";

type AssetsDistributionResourceProps = {
    origin: IOrigin
    certificateArn: string
    domainNames: string[]
}

export class CdnDistributionResource extends Construct {
    private readonly resource: Distribution;

    constructor(scope: Construct, id: string, props: AssetsDistributionResourceProps) {
        super(scope, id);

        const {origin, certificateArn, domainNames} = props;

        this.resource = new Distribution(this, "SiteDistribution", {
            comment: "CDN for serving banner assets",
            defaultRootObject: "index.html",
            minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
            priceClass: PriceClass.PRICE_CLASS_100,
            domainNames,
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

    public addInitJsonBehavior(path: string, origin: IOrigin, cachePolicy: CachePolicy): this {

        const countryHeaderPolicy = new OriginRequestPolicy(this, 'CountryHeaderPolicy', {
            originRequestPolicyName: 'IncludeCountryHeader',
            comment: 'Send CloudFront-Viewer-Country header to origin',
            headerBehavior: OriginRequestHeaderBehavior.allowList('CloudFront-Viewer-Country'),
        });

        this.getResource().addBehavior(path, origin, {
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

    public addDefaultBehavior(path: string, origin: IOrigin, cachePolicy: CachePolicy){
        this.getResource().addBehavior(path, origin, {
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
            cachePolicy: cachePolicy,
            compress: true,
        })

        return this;
    }

    addConsentStorageBehavior(path: string, url: string){
        this.getResource().addBehavior(path, new HttpOrigin(url, {
            protocolPolicy: OriginProtocolPolicy.HTTPS_ONLY,
        }), {
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            allowedMethods: AllowedMethods.ALLOW_ALL,
            cachePolicy: CachePolicy.CACHING_DISABLED,
            originRequestPolicy: OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        });
        return this;
    }

    public getResource(): Distribution {
        return this.resource;
    }
}
