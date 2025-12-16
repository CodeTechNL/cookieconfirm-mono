#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { getAwsEnv, getIdPrefix, getResourcePrefix, uuid } from "../lib/helpers";
import { CookieScannerStack } from "../lib/stacks/cookie-scanner-stack";

const app = new cdk.App();
const idPrefix = getIdPrefix(app);
const env = getAwsEnv();
const resourcePrefix = getResourcePrefix(app)



new CookieScannerStack(app, `CookieScannerStack`, {
    stackName: `${idPrefix}CookieScannerStack`,
    resourcePrefix,
    idPrefix,
    env,
});

app.synth();
