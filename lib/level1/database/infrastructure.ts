import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";

export interface DatabaseProps {
  attributeName: string;
}

export class Database extends Construct {
  public readonly cfnDynamoDbTable: dynamodb.CfnTable;

  constructor(scope: Construct, id: string, props: DatabaseProps) {
    super(scope, id);

    this.cfnDynamoDbTable = new dynamodb.CfnTable(this, "CfnDynamoDbTable", {
      keySchema: [
        {
          attributeName: props.attributeName,
          keyType: "HASH",
        },
      ],
      attributeDefinitions: [
        {
          attributeName: props.attributeName,
          attributeType: "S",
        },
      ],
      provisionedThroughput: {
        readCapacityUnits: 5,
        writeCapacityUnits: 5,
      },
    });
  }

  grantWriteData(cfnIamRole: iam.CfnRole) {
    const cfnPutDynamoDbIamPolicyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Action: ["dynamodb:PutItem"],
          Resource: [this.cfnDynamoDbTable.attrArn],
          Effect: "Allow",
        },
      ],
    };

    cfnIamRole.policies = [{
      policyDocument: cfnPutDynamoDbIamPolicyDocument,
      policyName: "PutDynamoDbIamPolicy",
    }];
  }
}
