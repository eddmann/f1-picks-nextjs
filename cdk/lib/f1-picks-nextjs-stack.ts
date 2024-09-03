import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { CfnOutput, Duration, IgnoreMode } from "aws-cdk-lib";
import { Platform } from "aws-cdk-lib/aws-ecr-assets";
import { DockerImageCode, DockerImageFunction, FunctionUrlAuthType, InvokeMode } from "aws-cdk-lib/aws-lambda";
import {
  AllowedMethods,
  CachePolicy,
  Distribution,
  OriginProtocolPolicy,
  OriginRequestPolicy,
  OriginSslPolicy,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { HttpOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { readFileSync } from "fs";
import { environment } from "./environment";

export class F1PicksNextJsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handler = new DockerImageFunction(this, "Handler", {
      code: DockerImageCode.fromImageAsset("../app", {
        file: "prod.Dockerfile",
        platform: Platform.LINUX_AMD64,
        ignoreMode: IgnoreMode.DOCKER,
        exclude: readFileSync("../app/.dockerignore").toString().split("\n"),
      }),
      timeout: Duration.seconds(28),
      environment,
      memorySize: 512,
    });

    const lambdaUrl = handler.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
      invokeMode: InvokeMode.RESPONSE_STREAM,
    });

    const cachedPathPatterns = ["/_next/static/*", "/favicon.ico"];
    const origin = new HttpOrigin(cdk.Fn.select(2, cdk.Fn.split("/", lambdaUrl.url)), {
      protocolPolicy: OriginProtocolPolicy.HTTPS_ONLY,
      originSslProtocols: [OriginSslPolicy.TLS_V1_2],
    });

    const distribution = new Distribution(this, "Distribution", {
      defaultBehavior: {
        origin,
        cachePolicy: CachePolicy.CACHING_DISABLED,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        originRequestPolicy: OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        allowedMethods: AllowedMethods.ALLOW_ALL,
      },
      additionalBehaviors: {
        ...Object.fromEntries(
          cachedPathPatterns.map((pathPattern) => [
            pathPattern,
            {
              origin,
              cachePolicy: CachePolicy.CACHING_OPTIMIZED,
              viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
              originRequestPolicy: OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
              allowedMethods: AllowedMethods.ALLOW_ALL,
            },
          ])
        ),
      },
    });

    new CfnOutput(this, "LambdaUrl", { value: lambdaUrl.url });
    new CfnOutput(this, "CloudFrontUrl", { value: `https://${distribution.domainName}` });
  }
}
