import {Construct} from "constructs"
import { Compatibility, CpuArchitecture, OperatingSystemFamily, TaskDefinition} from 'aws-cdk-lib/aws-ecs';
import {Role} from "aws-cdk-lib/aws-iam";

type TaskDefinitionProps = {
    taskRole: Role
}

export class TaskDefinitionResource extends TaskDefinition {
    constructor(scope: Construct, id: string, props: TaskDefinitionProps) {

        const {taskRole} = props;

        const baseProps = {
            compatibility: Compatibility.EC2_AND_FARGATE,
            cpu: '256',
            family: 'api-task-family',
            memoryMiB: '512',
            taskRole,
            runtimePlatform: {
                cpuArchitecture: CpuArchitecture.ARM64,
                operatingSystemFamily: OperatingSystemFamily.LINUX,
            }
        }

        super(scope, id, baseProps);
    }
}
