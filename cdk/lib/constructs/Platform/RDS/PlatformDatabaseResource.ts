import { Construct } from "constructs";
import {
    Credentials,
    DatabaseInstance,
    DatabaseInstanceEngine,
    DatabaseInstanceFromSnapshot,
    IDatabaseInstance,
    MysqlEngineVersion,
    SnapshotCredentials,
} from "aws-cdk-lib/aws-rds";
import { IConnectable, InstanceClass, InstanceSize, InstanceType, Port, SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { SecretValue } from "aws-cdk-lib";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { VpcResource } from "../VpcResource";

type PlatformDatabaseProps = {
    vpcResource: VpcResource;
    databaseName: string;
    allowGroups: IConnectable[];
    APP_ENV: string;
    idPrefix: string;
    resourcePrefix: string

    useSnapshot?: boolean;
    snapshotIdentifier?: string;
};

export class PlatformDatabaseResource extends Construct {
    private readonly database: IDatabaseInstance;
    private readonly databaseSecurityGroup: SecurityGroup;

    constructor(scope: Construct, id: string, props: PlatformDatabaseProps) {
        super(scope, id);

        const { allowGroups, vpcResource, idPrefix, resourcePrefix } = props;
        const { password, username } = this.getCredentials(idPrefix);

        const instanceIdentifier = "cc-cdk-sample-database";
        const databaseName = "cookieconfirmtest";

        this.databaseSecurityGroup = new SecurityGroup(this, `${idPrefix}DatabaseSG`, {
            vpc: vpcResource.getVpc(),
            description: "SecurityGroup associated with the MySQL RDS Instance",
            allowAllOutbound: false,
        });

        const commonProps = {
            databaseName,
            instanceIdentifier,
            allocatedStorage: 20,
            autoMinorVersionUpgrade: true,
            allowMajorVersionUpgrade: false,
            engine: DatabaseInstanceEngine.mysql({
                version: MysqlEngineVersion.VER_8_4_5,
            }),
            iamAuthentication: true,
            instanceType: InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.SMALL),
            maxAllocatedStorage: 250,
            multiAz: false,
            securityGroups: [this.databaseSecurityGroup],
            vpc: vpcResource.getVpc(),
            vpcSubnets: {
                subnetGroupName: vpcResource.SUBNET_ISOLATED.name,
            },
        };

        if (props.useSnapshot) {
            if (!props.snapshotIdentifier) {
                throw new Error("snapshotIdentifier is verplicht als useSnapshot = true");
            }

            // Restore vanuit snapshot, maar met jouw eigen user/password
            this.database = new DatabaseInstanceFromSnapshot(scope, `${idPrefix}MySqlDatabase`, {
                ...commonProps,
                snapshotIdentifier: props.snapshotIdentifier,
                credentials: {
                    password: SecretValue.unsafePlainText(password),
                    username: username,
                    generatePassword: false,
                },
            });
        } else {
            // Nieuwe lege instance
            this.database = new DatabaseInstance(scope, `${idPrefix}MySqlDatabase`, {
                ...commonProps,
                credentials: Credentials.fromPassword(username, SecretValue.unsafePlainText(password)),
            });
        }

        allowGroups.forEach((allowGroup) => {
            this.databaseSecurityGroup.connections.allowFrom(allowGroup, Port.tcp(3306));
        });
    }

    getDatabase() {
        return this.database;
    }

    getSecurityGroup() {
        return this.databaseSecurityGroup;
    }

    private getCredentials(idPrefix: string) {
        const password = StringParameter.fromStringParameterName(this, `${idPrefix}DatabasePassword`, `/${idPrefix}/DB_PASSWORD`).stringValue;

        const username = StringParameter.fromStringParameterName(this, `${idPrefix}DatabaseUsername`, `/${idPrefix}/DB_USERNAME`).stringValue;

        return { password, username };
    }
}
