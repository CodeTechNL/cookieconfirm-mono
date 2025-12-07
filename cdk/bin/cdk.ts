#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import { toPascalCase, uuid} from "../lib/helpers";
import {PlatformStack} from "../lib/stacks/platform-stack";
import {PhpImageStack} from "../lib/stacks/php-image-stack";
import {CookieScannerStack} from "../lib/stacks/cookie-scanner-stack";
import {ApplicationType} from "../lib/types/ApplicationType";
import {FoundationStack} from "../lib/stacks/PlatformStack/foundation-stack";
import {ConsentBannerStack} from "../lib/stacks/consent-banner-stack";

const envResult = dotenv.config({
    path: '../.env',
});

dotenvExpand.expand(envResult);

const app = new cdk.App();

const company = app.node.tryGetContext('company') || 'cookie-confirm'
const region = process.env.CDK_DEFAULT_REGION;
const account = process.env.CDK_DEFAULT_ACCOUNT;
const stage = app.node.tryGetContext('stage') || 'staging' as ApplicationType;
const idPrefix = toPascalCase(company) + toPascalCase(stage);
const resourcePrefix = `${company}-${stage}`;
const env = { region, account };
const version = uuid();

new PhpImageStack(app, `Php83Stack`, {
    imageName: 'ubuntu_php_8_3',
    env,
})

const foundationStack = new FoundationStack(app, `FoundationStack`, {
    stackName: `${idPrefix}FoundationStack`,
    env,
    idPrefix,
    version
})

const cookieScannerStack = new CookieScannerStack(app, `CookieScannerStack`, {
    stackName: `${idPrefix}CookieScannerStack`,
    idPrefix,
    env,
    environmentVariables: foundationStack.getEnvironmentResource(),
})

const platformStack = new PlatformStack(app, `PlatformStack`, {
    stackName: `${idPrefix}PlatformStack`,
    environmentVariables: foundationStack.getEnvironmentResource(),
    idPrefix,
    resourcePrefix,
    version,
    cdk: {
        baseDockerImage: '585008041582.dkr.ecr.eu-west-3.amazonaws.com/cdk-hnb659fds-container-assets-585008041582-eu-west-3:00bbf7bd00166c64d2fa83e315d2c261695a3da459e3899cd50bf9a52a96eb2f',
        certificateArn: 'arn:aws:acm:eu-west-3:585008041582:certificate/4b315ff2-8173-4192-a786-3ff9fca41399'
    },
    env
})

platformStack.addDependency(foundationStack)
cookieScannerStack.addDependency(foundationStack)

app.synth();
