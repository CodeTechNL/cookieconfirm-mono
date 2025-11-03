#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {ConsentStoreStack} from "../lib/stacks/consent-store-stack";
import {CdnStack} from "../lib/stacks/cdn-stack";

const app = new cdk.App();

new ConsentStoreStack(app, 'ConsentStoreStack', {
    env: {
        region: 'us-east-1',
    }
});

new CdnStack(app, 'CdnStack', {
    env: {
        region: 'us-east-1',
    }
})