import { Construct } from "constructs";
import {FileSystem as EfsFileSystem} from "aws-cdk-lib/aws-efs";
import {RemovalPolicy} from "aws-cdk-lib/core";
import {Vpc} from "aws-cdk-lib/aws-ec2";

type MeilisearchServiceProps = {
    resourcePrefix: string;
    vpc: Vpc
};

export class MeilisearchFileSystem extends EfsFileSystem {
    constructor(scope: Construct, id: string, props: MeilisearchServiceProps) {
        const {vpc, resourcePrefix } = props;

        super(scope, id, {
            fileSystemName: `${resourcePrefix}-meilisearch-fs`,
            vpc,
            encrypted: true,
            removalPolicy: RemovalPolicy.RETAIN,
        });
    }

    addMeilisearchAccessPoint(idPrefix: string) {
        return this.addAccessPoint(`${idPrefix}MeiliAccessPoint`, {
            path: '/efs',
            posixUser: { uid: "1000", gid: "1000" },
            createAcl: { ownerUid: "1000", ownerGid: "1000", permissions: "0777" },
        });
    }
}
