import {Construct} from "constructs"
import {CfnCacheCluster, CfnSubnetGroup} from "aws-cdk-lib/aws-elasticache";
import {IConnectable, Port, SecurityGroup, Vpc} from "aws-cdk-lib/aws-ec2";


type RedisCacheClusterProps = {
    vpc: Vpc,
    allowConnections: IConnectable[]
}

export class RedisCacheClusterResource extends Construct {
    private redis: CfnCacheCluster;

    constructor(scope: Construct, id: string, props: RedisCacheClusterProps) {
        super(scope, id);

        const {vpc, allowConnections} = props;

        const redisSecurityGroup = new SecurityGroup(this, 'redis-SG', {
            vpc,
            description: 'SecurityGroup associated with the ElastiCache Redis Cluster',
            allowAllOutbound: false
        });

        // // ELASTICACHE
        const redisSubnetGroup = new CfnSubnetGroup(this, 'redis-subnet-group', {
            description: 'Redis Subnet Group',
            subnetIds: vpc.isolatedSubnets.map(s => s.subnetId),
            cacheSubnetGroupName: 'RedisSubnetGroup'
        });

        this.redis = new CfnCacheCluster(this, 'RedisCacheClusterResource', {
            cacheNodeType: 'cache.t3.small',
            cacheSubnetGroupName: redisSubnetGroup.cacheSubnetGroupName,
            clusterName: 'redis-cluster',
            engine: 'redis',
            engineVersion: '6.x',
            numCacheNodes: 1,
            port: 6379,
            vpcSecurityGroupIds: [redisSecurityGroup.securityGroupId]
        })

        allowConnections.forEach(allowConnection => {
            redisSecurityGroup.connections.allowFrom(allowConnection, Port.tcp(6379), 'Application ingress 6379');
        });

        this.getRedis().node.addDependency(redisSubnetGroup);
    }

    getRedis():CfnCacheCluster{
        return this.redis;
    }
}
