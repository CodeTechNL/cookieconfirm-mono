import {Duration} from "aws-cdk-lib"
import {Architecture, DockerImageCode, DockerImageFunction } from "aws-cdk-lib/aws-lambda"
import {Construct} from "constructs"
import {Platform} from "aws-cdk-lib/aws-ecr-assets";
import {fromRoot} from "../../../helpers";


type CookieScannerLambdaContainerProps = {
    eventSource: string
    eventDetail: string
    bus: string
}

export class CookieScannerLambdaContainerResource extends DockerImageFunction {
    constructor(scope: Construct, id: string, props: CookieScannerLambdaContainerProps) {
        const {eventSource, eventDetail, bus} = props;

        const baseProps = {
            code: DockerImageCode.fromImageAsset(fromRoot("cookie-scanner"), {
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
                HOME: "/tmp/chrome-home",
                XDG_RUNTIME_DIR: "/tmp/runtime-dir",
                XDG_CONFIG_HOME: "/tmp/chrome-home/.config",
                XDG_CACHE_HOME: "/tmp/chrome-home/.cache",
                XDG_DATA_HOME: "/tmp/chrome-home/.local/share",
                DBUS_SESSION_BUS_ADDRESS: "/dev/null",
            }
        };

        super(scope, id, baseProps);
    }
}
