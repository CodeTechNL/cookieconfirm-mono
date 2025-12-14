#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import {getAwsEnv} from "../lib/helpers";
import { PhpImageStack } from "../lib/stacks/php-image-stack";
import * as dotenv from "dotenv";

dotenv.config();

const app = new cdk.App();
const env = getAwsEnv();

console.log("env:", env);

new PhpImageStack(app, `Php83Stack`, {
    imageName: "ubuntu_php_8_3",
    env,
});

app.synth();
