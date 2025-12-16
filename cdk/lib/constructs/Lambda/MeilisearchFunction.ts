import { Construct } from "constructs";
import {
    Architecture,
    DockerImageCode,
    DockerImageFunction,
    FileSystem,
} from "aws-cdk-lib/aws-lambda";
import {ISecurityGroup, Vpc} from "aws-cdk-lib/aws-ec2";
import { Duration } from "aws-cdk-lib/core";
import { AccessPoint } from "aws-cdk-lib/aws-efs";
import { fromRoot } from "../../helpers";

type MeilisearchFunctionProps = {
    vpc: Vpc;
    ap: AccessPoint;
    password: string;
    securityGroups: ISecurityGroup[];
};

export class MeilisearchFunction extends DockerImageFunction {
    constructor(scope: Construct, id: string, props: MeilisearchFunctionProps) {
        const { vpc, ap, password, securityGroups } = props;

        super(scope, id, {
            code: DockerImageCode.fromImageAsset(fromRoot("search-engine")),
            vpc,
            securityGroups,
            timeout: Duration.seconds(30),
            memorySize: 1024,
            architecture: Architecture.ARM_64,

            // Mount EFS access point to this path INSIDE the container
            filesystem: FileSystem.fromEfsAccessPoint(ap, "/mnt/efs"),

            environment: {
                // Lambda Web Adapter
                AWS_LWA_PORT: "7700",
                AWS_LWA_READINESS_CHECK_PATH: "/health",
                AWS_LWA_READINESS_CHECK_PORT: "7700",

                // Meilisearch
                MEILI_HTTP_ADDR: "0.0.0.0:7700",
                MEILI_ENV: "production",

                MEILI_DB_PATH: '/mnt/efs/data',
                MEILI_DUMP_DIR: '/mnt/efs/dump',
                MEILI_SNAPSHOT_DIR: '/mnt/efs/snapshot',

                MEILI_MASTER_KEY: password,
            },
        });
    }
}
