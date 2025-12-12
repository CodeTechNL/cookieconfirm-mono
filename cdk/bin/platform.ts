#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { getAwsEnv, getIdPrefix, getResourcePrefix, uuid } from "../lib/helpers";
import { PlatformStack } from "../lib/stacks/platform-stack";
import { PhpImageStack } from "../lib/stacks/php-image-stack";
import { FoundationStack } from "../lib/stacks/PlatformStack/foundation-stack";

const app = new cdk.App();
const idPrefix = getIdPrefix(app);
const resourcePrefix = getResourcePrefix(app);
const env = getAwsEnv();
const version = uuid();

new PhpImageStack(app, `Php83Stack`, {
    imageName: "ubuntu_php_8_3",
    env,
});

const foundationStack = new FoundationStack(app, `FoundationStack`, {
    resourcePrefix,
    stackName: `${idPrefix}FoundationStack`,
    env,
    idPrefix,
    version,
});

const platformStack = new PlatformStack(app, `PlatformStack`, {
    stackName: `${idPrefix}PlatformStack`,
    environmentVariables: foundationStack.getEnvironmentResource(),
    idPrefix,
    resourcePrefix,
    version,
    cdk: {
        baseDockerImage:
            "585008041582.dkr.ecr.eu-west-3.amazonaws.com/cdk-hnb659fds-container-assets-585008041582-eu-west-3:00bbf7bd00166c64d2fa83e315d2c261695a3da459e3899cd50bf9a52a96eb2f",
        certificateArn: "arn:aws:acm:eu-west-3:585008041582:certificate/4b315ff2-8173-4192-a786-3ff9fca41399",
    },
    env,
});

platformStack.addDependency(foundationStack);

app.synth();
