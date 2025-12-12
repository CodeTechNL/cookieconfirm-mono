#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { getAwsEnv, getIdPrefix, getResourcePrefix, uuid } from "../lib/helpers";
import { CookieScannerStack } from "../lib/stacks/cookie-scanner-stack";
import { FoundationStack } from "../lib/stacks/PlatformStack/foundation-stack";

const app = new cdk.App();
const idPrefix = getIdPrefix(app);
const env = getAwsEnv();
const version = uuid();
const resourcePrefix = getResourcePrefix(app);

const foundationStack = new FoundationStack(app, `FoundationStack`, {
    resourcePrefix,
    stackName: `${idPrefix}FoundationStack`,
    env,
    idPrefix,
    version,
});

const cookieScannerStack = new CookieScannerStack(app, `CookieScannerStack`, {
    stackName: `${idPrefix}CookieScannerStack`,
    idPrefix,
    env,
    environmentVariables: foundationStack.getEnvironmentResource(),
});

cookieScannerStack.addDependency(foundationStack);

app.synth();
