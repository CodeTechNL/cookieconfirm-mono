#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import {getAwsEnv, getIdPrefix, getResourcePrefix} from "../lib/helpers";
import * as dotenv from "dotenv";
import {MeilisearchStack} from "../lib/stacks/meilisearch-stack";

dotenv.config();

const app = new cdk.App();
const idPrefix = getIdPrefix(app);
const resourcePrefix = getResourcePrefix(app);
const env = getAwsEnv();

new MeilisearchStack(app, `MeilisearchStack`, {
    stackName: `${idPrefix}MeilisearchStack`,
    idPrefix,
    resourcePrefix,
    env,
});

app.synth();
