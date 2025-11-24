import {Construct} from "constructs"
import {ApiDestination, Authorization, Connection, HttpMethod, HttpParameter} from "aws-cdk-lib/aws-events";
import {DatabaseInstance, DatabaseInstanceEngine, Endpoint, MysqlEngineVersion} from "aws-cdk-lib/aws-rds";
import {
    IConnectable,
    InstanceClass,
    InstanceSize,
    InstanceType,
    Port,
    SecurityGroup,
    SubnetType,
    Vpc
} from "aws-cdk-lib/aws-ec2";


type PlatformDatabaseProps = {
    vpc: Vpc
    isolatedSubnetName: string
    databaseName: string
    allowGroups: IConnectable[]
}

export class PlatformDatabaseResource extends Construct {
    private readonly database: DatabaseInstance;

    constructor(scope: Construct, id: string, props: PlatformDatabaseProps) {
        super(scope, id);

        const {vpc, isolatedSubnetName, allowGroups} = props;
        // RDS
        const databaseSecurityGroup = new SecurityGroup(this, 'database-SG', {
            vpc,
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
            vpc,
            vpcSubnets: {
                subnetGroupName: isolatedSubnetName
            }
        });

        allowGroups.forEach(allowGroup => {
            databaseSecurityGroup.connections.allowFrom(allowGroup, Port.tcp(3306));
        });
    }

    getDatabase(){
        return this.database;
    }
}
