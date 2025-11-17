import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

export class ConfigStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const appConfig = {
            COOKIE_WEBHOOK: "https://api.cookieconfirm.tech/webhook",
            BANNER_URL: "https://cdn.cookieconfirm.tech/banner/",
            APP_ENV: "production",
            REGION: "eu-west-1",
        };

        new StringParameter(this, "CookieConfirmConfig", {
            parameterName: "/cc/prod/config",   // jouw key
            stringValue: JSON.stringify(appConfig),
        });
    }
}
