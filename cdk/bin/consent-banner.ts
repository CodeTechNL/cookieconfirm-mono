#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { getAwsEnv, getIdPrefix, getResourcePrefix, uuid } from "../lib/helpers";
import { ConsentBannerStack } from "../lib/stacks/consent-banner-stack";

const app = new App();
const idPrefix = getIdPrefix(app);
const env = getAwsEnv();
const resourcePrefix = getResourcePrefix(app);

new ConsentBannerStack(app, "ConsentBannerStack", {
    stackName: `${idPrefix}ConsentBannerStack`,
    idPrefix,
    resourcePrefix,
    env,
});

app.synth();
