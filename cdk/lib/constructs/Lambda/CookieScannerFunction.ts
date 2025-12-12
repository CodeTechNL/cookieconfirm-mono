import { Duration } from "aws-cdk-lib";
import { Architecture, DockerImageCode, DockerImageFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { Platform } from "aws-cdk-lib/aws-ecr-assets";
import { fromRoot } from "../../helpers";

type CookieScannerLambdaContainerProps = {
  eventSource: string;
  eventDetail: string;
  bus: string;
};

export class CookieScannerFunction extends DockerImageFunction {
  constructor(scope: Construct, id: string, props: CookieScannerLambdaContainerProps) {
    const { eventSource, eventDetail, bus } = props;

    super(scope, id, {
      code: DockerImageCode.fromImageAsset(fromRoot("lambda", "cookie-scanner"), {
        file: "Dockerfile",
        platform: Platform.LINUX_AMD64,
      }),
      timeout: Duration.minutes(15),
      memorySize: 2048,
      architecture: Architecture.X86_64,
      environment: {
        EVENT_SOURCE_NAME: eventSource,
        EVENT_DETAIL_TYPE: eventDetail,
        EVENT_BUS_NAME: bus,
      },
    });
  }
}
