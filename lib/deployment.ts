import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Api as ApiLevel1 } from "./level1/api/infrastructure";
import { Database as DatabaseLevel1 } from "./level1/database/infrastructure";
import { Api as ApiLevel2 } from "./level2/api/infrastructure";
import { Database as DatabaseLevel2 } from "./level2/database/infrastructure";
import { CfnOutput } from "aws-cdk-lib";

export class CdkBlogLevel1 extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const database = new DatabaseLevel1(this, "Database", {
      attributeName: "id",
    });

    const api = new ApiLevel1(this, "Api", {
      dynamoDbTableArn: database.cfnDynamoDbTable.attrArn,
      apiName: "ApiGatewayRestApi",
    });

    database.grantWriteData(api.cfnLambdaIamRole)

    new CfnOutput(this, "ApiEndpoint", {
      value: api.endpoint,
    });
  }
}

export class CdkBlogLevel2 extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const database = new DatabaseLevel2(this, "Database", {
      attributeName: "id",
    });

    const api = new ApiLevel2(this, "Api", {
      dynamoDbTableName: database.dynamoDbTable.tableName!,
    });

    database.dynamoDbTable.grantWriteData(api.lambdaFunction);
  }
}
