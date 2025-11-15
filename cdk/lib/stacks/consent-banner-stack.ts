import {Duration, Stack, StackProps} from "aws-cdk-lib"
import {Construct} from "constructs"
import {ConsentStorageStack} from "./ConsentBannerStacks/consent-storage-stack";
import {FrontendBannerStack} from "./ConsentBannerStacks/frontend-banner-stack";

interface ConsentBannerStackProps extends StackProps {
    app: {
        url: string;
        cdnUrl: string;
    },
    aws: {
        region: string;
        account: string
    },
    services: {
        cloudfront: {
            certificateArn: string
            hostedZoneDomain: string,
            recordName: string
        },
        firehose: {
            streamName: string
            streamInterval: number,
            streamSize: number,
        },
        s3: {
            jsonFilesBucketName: string
            javascriptBucketName: string
        },
        athena: {
            athenaConsentLogBucket: string
            table: string
            database: string
            workGroup: string
            storagePathS3: string
        }
    }
}

export class ConsentBannerStack extends Stack {
    constructor(scope: Construct, id: string, props: ConsentBannerStackProps) {
        super(scope, id, props)

        const app = props.app;
        const athenaConfig = props.services.athena
        const firehoseConfig = props.services.firehose
        const awsConfig = props.aws
        const s3Config = props.services.s3
        const cloudfrontConfig = props.services.cloudfront;

        const consentBannerStack = new ConsentStorageStack(this, 'ConsentBannerStack', {
            services: {
                athena: {
                    workGroup: athenaConfig.workGroup,
                    rawBucket: athenaConfig.athenaConsentLogBucket,
                    database: athenaConfig.database,
                    table: athenaConfig.table,
                    storagePathS3: athenaConfig.storagePathS3
                },
                firehose: {
                    streamName: firehoseConfig.streamName,
                    streamInterval: firehoseConfig.streamInterval,
                    streamSize: firehoseConfig.streamSize
                },
            },
            env: {
                region: awsConfig.region,
                account: awsConfig.account,
            },
        });

        const cloudfrontStack = new FrontendBannerStack(this, 'CloudfrontDistributionStack', {
            app: {
                url: app.url,
                cdnUrl: app.cdnUrl
            },
            services: {
                cloudfront: {
                    certificateArn: cloudfrontConfig.certificateArn,
                    hostedZoneDomain: cloudfrontConfig.hostedZoneDomain,
                    recordName: cloudfrontConfig.recordName
                },
                firehose: {
                    streamName: firehoseConfig.streamName,
                },
                athena: {
                    athenaConsentLogBucket: athenaConfig.athenaConsentLogBucket,
                },
                s3: {
                    jsonFilesBucketName: s3Config.jsonFilesBucketName,
                    javascriptBucketName: s3Config.javascriptBucketName,
                },
            },
            env: {
                region: awsConfig.region,
                account: awsConfig.account,
            },
        });

        consentBannerStack.addDependency(cloudfrontStack);

    }
}
