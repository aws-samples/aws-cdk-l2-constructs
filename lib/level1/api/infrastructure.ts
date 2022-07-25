import { Construct } from "constructs";
import { Stack } from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";

const fs = require("fs");
import * as path from "path";

export interface ApiProps {
  dynamoDbTableArn: string;
  apiName: string;
}

export class Api extends Construct {
  public readonly cfnLambdaIamRole: iam.CfnRole;
  public readonly endpoint: string;

  constructor(scope: Construct, id: string, props: ApiProps) {
    super(scope, id);

    const cfnLambdaAssumeIamPolicyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: {
            Service: "lambda.amazonaws.com",
          },
          Action: "sts:AssumeRole",
        },
      ],
    };

    this.cfnLambdaIamRole = new iam.CfnRole(this, "cfnLambdaIamRole", {
      assumeRolePolicyDocument: cfnLambdaAssumeIamPolicyDocument,
      managedPolicyArns: [
        "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
      ],
    });

    const cfnLambdaFunction = new lambda.CfnFunction(
      this,
      "CfnLambdaFunction",
      {
        code: {
          zipFile: fs.readFileSync(
            path.resolve(__dirname, "runtime/index.js"),
            "utf8"
          ),
        },
        role: this.cfnLambdaIamRole.attrArn,
        runtime: "nodejs16.x",
        handler: "index.handler",

        environment: {
          variables: {
            TABLE_NAME: props.dynamoDbTableArn,
          },
        },
      }
    );

    const cfnApiGatewayAssumeIamPolicyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: {
            Service: "apigateway.amazonaws.com",
          },
          Action: "sts:AssumeRole",
        },
      ],
    };

    const cfnApiGatewayInvokeLambdaIamPolicyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Action: ["lambda:InvokeFunction"],
          Resource: [cfnLambdaFunction.attrArn],
          Effect: "Allow",
        },
      ],
    };

    const cfnApiGatewayIamRole = new iam.CfnRole(this, "cfnApiGatewayIamRole", {
      assumeRolePolicyDocument: cfnApiGatewayAssumeIamPolicyDocument,
      policies: [
        {
          policyDocument: cfnApiGatewayInvokeLambdaIamPolicyDocument,
          policyName: "ApiGatewayInvokeLambdaIamPolicy",
        },
      ],
    });

    const cfnApiGatewayRestApi = new apigateway.CfnRestApi(
      this,
      "CfnApiGatewayRestApi",
      {
        name: props.apiName,
      }
    );

    const cfnApiGatewayPostMethod = new apigateway.CfnMethod(
      this,
      "CfnApiGatewayPostMethod",
      {
        httpMethod: "POST",
        resourceId: cfnApiGatewayRestApi.attrRootResourceId,
        restApiId: cfnApiGatewayRestApi.ref,
        authorizationType: "NONE",
        integration: {
          credentials: cfnApiGatewayIamRole.attrArn,
          type: "AWS_PROXY",
          integrationHttpMethod: "ANY",
          uri:
            "arn:aws:apigateway:" +
            Stack.of(this).region +
            ":lambda:path/2015-03-31/functions/" +
            cfnLambdaFunction.attrArn +
            "/invocations",
          passthroughBehavior: "WHEN_NO_MATCH",
        },
      }
    );

    const cfnApiGatewayOptionsMethod = new apigateway.CfnMethod(
      this,
      "CfnApiGatewayOptionsMethod",
      {
        httpMethod: "OPTIONS",
        resourceId: cfnApiGatewayRestApi.attrRootResourceId,
        restApiId: cfnApiGatewayRestApi.ref,
        authorizationType: "NONE",
        integration: {
          type: "MOCK",
          integrationResponses: [
            {
              statusCode: "200",
              responseParameters: {
                "method.response.header.Access-Control-Allow-Headers":
                  "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
                "method.response.header.Access-Control-Allow-Methods":
                  "'OPTIONS,GET,PUT,POST,DELETE,PATCH,HEAD'",
                "method.response.header.Access-Control-Allow-Origin": "'*'",
              },
            },
          ],
          passthroughBehavior: "WHEN_NO_MATCH",
          requestTemplates: {
            "application/json": '{"statusCode": 200}',
          },
        },
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Access-Control-Allow-Headers": true,
              "method.response.header.Access-Control-Allow-Methods": true,
              "method.response.header.Access-Control-Allow-Origin": true,
            },
            responseModels: {
              "application/json": "Empty",
            },
          },
        ],
      }
    );

    const cfnApiGatewayDeployment = new apigateway.CfnDeployment(
      this,
      "cfnApiGatewayDeployment",
      {
        restApiId: cfnApiGatewayRestApi.ref,
        stageName: "prod",
      }
    );

    cfnApiGatewayDeployment.addDependsOn(cfnApiGatewayOptionsMethod);
    cfnApiGatewayDeployment.addDependsOn(cfnApiGatewayPostMethod);

    this.endpoint =
      "https://" +
      cfnApiGatewayRestApi.ref +
      ".execute-api." +
      Stack.of(this).region +
      ".amazonaws.com/" +
      cfnApiGatewayDeployment.stageName +
      "/";
  }
}
