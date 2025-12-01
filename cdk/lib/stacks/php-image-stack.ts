import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DockerImageAsset, Platform } from 'aws-cdk-lib/aws-ecr-assets';
import {fromRoot, toPascalCase} from "../helpers";
import {AwsCustomResource, AwsCustomResourcePolicy} from "aws-cdk-lib/custom-resources";

type AvailableImages = "ubuntu_php_8_3";

interface PhpImageStackProps extends StackProps {
    imageName: AvailableImages
}

export class PhpImageStack extends Stack {
    constructor(scope: Construct, id: string, props: PhpImageStackProps) {
        super(scope, id, props);

        const {imageName} = props;

        // Pad naar je base Dockerfile (pas aan naar jouw repo structuur)
        const baseDir = fromRoot('platform', 'docker')

        const imageAsset = new DockerImageAsset(this, 'BasePhpImage', {
            directory: baseDir,
            file: `./${imageName}.Dockerfile`,          // Dockerfile naam
            platform: Platform.LINUX_ARM64, // voor Fargate Graviton,
            displayName: `PhpImage-${imageName}`,
        });

        // 1) Manifest van de hash-tag ophalen
        const getManifest = new AwsCustomResource(this, `GetManifest${toPascalCase(imageName)}`, {
            onCreate: {
                service: 'ECR',
                action: 'batchGetImage',
                parameters: {
                    repositoryName: imageAsset.repository.repositoryName,
                    imageIds: [
                        { imageTag: imageAsset.imageTag }, // de hash-tag van DockerImageAsset
                    ],
                },
                physicalResourceId: { id: `get-manifest-${imageAsset.imageTag}` },
            },
            policy: AwsCustomResourcePolicy.fromSdkCalls({
                resources: AwsCustomResourcePolicy.ANY_RESOURCE,
            }),
        });

        // 2) Zelfde image met tag "latest" wegschrijven
        new AwsCustomResource(this, `TagLatest${toPascalCase(imageName)}`, {
            onCreate: {
                service: 'ECR',
                action: 'putImage',
                parameters: {
                    repositoryName: imageAsset.repository.repositoryName,
                    imageManifest: getManifest.getResponseField('images.0.imageManifest'),
                    imageTag: 'latest',
                },
                physicalResourceId: { id: `tag-latest-${imageAsset.imageTag}` },
            },
            policy: AwsCustomResourcePolicy.fromSdkCalls({
                resources: AwsCustomResourcePolicy.ANY_RESOURCE,
            }),
        });


        // Handige outputs
        new CfnOutput(this, `BasePhpImageUri${toPascalCase(imageName)}`, {
            value: imageAsset.imageUri,
            exportName: `BasePhpImageUri${toPascalCase(imageName)}`,
        });

        new CfnOutput(this, `BasePhpImageRepositoryUri${toPascalCase(imageName)}`, {
            value: imageAsset.repository.repositoryUri,
            exportName: `BasePhpImageRepositoryUri${toPascalCase(imageName)}`,
        });

        new CfnOutput(this, `BasePhpImageTag${toPascalCase(imageName)}`, {
            value: imageAsset.imageTag,
            exportName: `BasePhpImageTag${toPascalCase(imageName)}`,
        });
    }
}
