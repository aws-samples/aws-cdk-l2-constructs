import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export interface DatabaseProps {
  attributeName: string;
}

export class Database extends Construct {
  public readonly dynamoDbTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: DatabaseProps) {
    super(scope, id);

    this.dynamoDbTable = new dynamodb.Table(this, "DynamoDbTable", {
      partitionKey: {
        name: props.attributeName,
        type: dynamodb.AttributeType.STRING,
      },
    });
  }
}
