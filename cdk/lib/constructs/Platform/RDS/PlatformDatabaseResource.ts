import {Construct} from "constructs"
import {Credentials, DatabaseInstance, DatabaseInstanceEngine, Endpoint, MysqlEngineVersion} from "aws-cdk-lib/aws-rds";
import {
    IConnectable,
    InstanceClass,
    InstanceSize,
    InstanceType,
    Port,
    SecurityGroup,
} from "aws-cdk-lib/aws-ec2";
import {SecretValue} from "aws-cdk-lib";
import {StringParameter} from "aws-cdk-lib/aws-ssm";
import {VpcResource} from "../VpcResource";


type PlatformDatabaseProps = {
    vpcResource: VpcResource;
    databaseName: string
    allowGroups: IConnectable[]
    APP_ENV: string
    prefix: string
}

export class PlatformDatabaseResource extends Construct {
    private readonly database: DatabaseInstance;

    constructor(scope: Construct, id: string, props: PlatformDatabaseProps) {
        super(scope, id);

        const {password, username} = this.getCredentials(props.prefix);

        const {allowGroups, vpcResource} = props;

        const databaseSecurityGroup = new SecurityGroup(this, 'database-SG', {
            vpc: vpcResource.getVpc(),
            description: 'SecurityGroup associated with the MySQL RDS Instance',
            allowAllOutbound: false
        });

        this.database = new DatabaseInstance(scope, 'primary-db', {
            allocatedStorage: 20,
            autoMinorVersionUpgrade: true,
            allowMajorVersionUpgrade: false,
            databaseName: 'example',
            engine: DatabaseInstanceEngine.mysql({
                version: MysqlEngineVersion.VER_8_4_5
            }),
            iamAuthentication: true,
            instanceType: InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.SMALL),
            maxAllocatedStorage: 250,
            multiAz: false,
            securityGroups: [databaseSecurityGroup],
            credentials: Credentials.fromPassword(
                username,
                SecretValue.unsafePlainText(password),
            ),
            vpc: vpcResource.getVpc(),
            vpcSubnets: {
                subnetGroupName: vpcResource.SUBNET_ISOLATED.name
            }
        });

        allowGroups.forEach(allowGroup => {
            databaseSecurityGroup.connections.allowFrom(allowGroup, Port.tcp(3306));
        });
    }

    getDatabase(){
        return this.database;
    }

    private getCredentials(prefix:string) {
        const password = StringParameter.fromStringParameterName(
            this,
            `${prefix}DatabasePassword`,
            `/${prefix}/DB_PASSWORD`
        ).stringValue

        const username = StringParameter.fromStringParameterName(
            this,
            `${prefix}DatabaseUsername`,
            `/${prefix}/DB_USERNAME`
        ).stringValue

        return {password, username}
    }
}
