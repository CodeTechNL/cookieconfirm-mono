import { Construct } from "constructs";
import {
    Instance,
    InstanceClass,
    InstanceSize,
    InstanceType,
    IVpc,
    MachineImage,
    SecurityGroup,
    SubnetType,
    Port,
    ISecurityGroup,
    Peer, UserData,
} from "aws-cdk-lib/aws-ec2";
import { Role, ServicePrincipal, ManagedPolicy } from "aws-cdk-lib/aws-iam";

export interface BastionHostProps {
    vpc: IVpc;
    rdsSecurityGroup?: ISecurityGroup;
    /**
     * Optioneel: EC2 key pair voor SSH. Laat weg als je alleen SSM wilt gebruiken.
     */
    keyName?: string;
}

export class JumpboxResource extends Construct {
    public readonly instance: Instance;
    public readonly securityGroup: SecurityGroup;

    constructor(scope: Construct, id: string, props: BastionHostProps) {
        super(scope, id);

        const { vpc, rdsSecurityGroup, keyName } = props;

        this.securityGroup = new SecurityGroup(this, "BastionSecurityGroup", {
            vpc,
            allowAllOutbound: true,
            description: "Security group for Bastion / Jumpbox",
        });

        // SSH vanaf overal (0.0.0.0/0) ? let op: dit is bewust wijd open
        this.securityGroup.addIngressRule(
            Peer.anyIpv4(),
            Port.tcp(22),
            "Allow SSH from anywhere"
        );

        const role = new Role(this, "BastionRole", {
            assumedBy: new ServicePrincipal("ec2.amazonaws.com"),
        });

        // Voor Session Manager
        role.addManagedPolicy(
            ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore")
        );

        // UserData bootstrap script
        const userData = UserData.forLinux();
        userData.addCommands(
            "set -eux",
            "dnf update -y",

            // AWS CLI
            "dnf install -y awscli",

            // MySQL (mysql + mysqldump) via mariadb105 ? aanbevolen door AWS voor AL2023
            "dnf clean all",
            "dnf makecache",
            "dnf install -y mariadb105",

            "echo 'AWS CLI + MySQL client tools geïnstalleerd.'"
        );


        this.instance = new Instance(this, "BastionInstance", {
            vpc,
            vpcSubnets: { subnetType: SubnetType.PUBLIC },
            instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
            machineImage: MachineImage.latestAmazonLinux2023(),
            securityGroup: this.securityGroup,
            role,
            instanceName: "Jumpbox",
            userData,
        });

        if (rdsSecurityGroup) {
            rdsSecurityGroup.addIngressRule(
                this.securityGroup,
                Port.tcp(3306),
                "Allow MySQL from Bastion host"
            );
        }
    }
}
