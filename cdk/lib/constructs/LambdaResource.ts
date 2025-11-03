import {Construct} from "constructs";
import {Function as LambdaFunction, Code, Runtime} from "aws-cdk-lib/aws-lambda"
import {CfnOutput} from "aws-cdk-lib";
import {CfnInput} from "aws-cdk-lib/aws-iotevents";
import {fromRoot} from "../path-helpers";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "node:path";
import * as cdk from "aws-cdk-lib";
type LambdaFunctionProps = {
    app: string
}

export class LambdaResource extends Construct {

    public readonly lambdaFunction: LambdaFunction;

    constructor(scope: Construct, id: string, props: LambdaFunctionProps) {
        super(scope, id);

        this.lambdaFunction = new NodejsFunction(this, id, {
            runtime: Runtime.NODEJS_22_X,
            entry: fromRoot('lambda',props.app, 'handler.ts'),
            handler: 'handler',
            bundling: {
                externalModules: ["@aws-sdk/client-s3"]
            }
        });

        new CfnOutput(this, 'Lambda_'+id, {
            value: this.lambdaFunction.functionName,
        })

    }
}