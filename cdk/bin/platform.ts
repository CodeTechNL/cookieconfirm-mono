#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import {getAwsEnv, getIdPrefix, getResourcePrefix, loadAwsProfileEnv, uuid} from "../lib/helpers";
import { PlatformStack } from "../lib/stacks/platform-stack";
import { FoundationStack } from "../lib/stacks/PlatformStack/foundation-stack";
import * as dotenv from "dotenv";

dotenv.config();

const app = new cdk.App();
const idPrefix = getIdPrefix(app);
const resourcePrefix = getResourcePrefix(app);
const env = getAwsEnv();
const version = uuid();

// const foundationStack = new FoundationStack(app, `FoundationStack`, {
//     resourcePrefix,
//     stackName: `${idPrefix}FoundationStack`,
//     env,
//     idPrefix,
//     version,
// });

new PlatformStack(app, `PlatformStack`, {
    stackName: `${idPrefix}PlatformStack`,
    // environmentVariables: foundationStack.getEnvironmentResource(),
    idPrefix,
    resourcePrefix,
    version,
    cdk: {
        baseDockerImage: "830424059839.dkr.ecr.eu-central-1.amazonaws.com/cdk-hnb659fds-container-assets-830424059839-eu-central-1:7b6350f9ff268689e1c9145f6a957954780a27c7380b62917adddeede702f1de",
    },
    env,
});

// platformStack.addDependency(foundationStack);

app.synth();
