import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda_nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";

import * as path from "path";

export interface ApiProps {
  dynamoDbTableName: string;
}

export class Api extends Construct {
  public readonly api: apigateway.RestApi;
  public readonly lambdaFunction: lambda_nodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: ApiProps) {
    super(scope, id);

    this.lambdaFunction = new lambda_nodejs.NodejsFunction(
      this,
      "LambdaFunction",
      {
        entry: path.resolve(__dirname, "runtime/index.ts"),
        runtime: lambda.Runtime.NODEJS_16_X,
        environment: {
          TABLE_NAME: props.dynamoDbTableName,
        },
      }
    );

    this.api = new apigateway.RestApi(this, "ApiGatewayRestApi", {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    this.api.root.addMethod(
      "POST",
      new apigateway.LambdaIntegration(this.lambdaFunction, {
        proxy: true,
      })
    );
  }
}
