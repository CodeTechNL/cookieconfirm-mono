#!/usr/bin/env node
import {App} from 'aws-cdk-lib';
import {getAwsEnv, getIdPrefix, uuid} from "../lib/helpers";
import {FoundationStack} from "../lib/stacks/PlatformStack/foundation-stack";
import {ConsentBannerStack} from "../lib/stacks/consent-banner-stack";

const app = new App();
const idPrefix = getIdPrefix(app);
const env = getAwsEnv();
const version = uuid();

const foundationStack = new FoundationStack(app, `FoundationStack`, {
    stackName: `${idPrefix}FoundationStack`,
    env,
    idPrefix,
    version
});

const consentBannerStack = new ConsentBannerStack(app, 'ConsentBannerStack', {
    stackName: `${idPrefix}ConsentBannerStack`,
    environment: foundationStack.getEnvironmentResource(),
    idPrefix,
    env
})

consentBannerStack.addDependency(foundationStack)

app.synth();
