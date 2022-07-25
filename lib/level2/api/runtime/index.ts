import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { env } from "process";

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log("event:", event);
  let responseCode = 200;
  let responseMsg = "Ok";
  if (!event.body) {
    return {
      body: JSON.stringify("No body sent"),
      statusCode: 400,
    };
  }

  const task = JSON.parse(event.body);
  const dynamoClient = new DynamoDB.DocumentClient();

  const params = {
    TableName: env.TABLE_NAME!,
    Item: {
      id: task.id,
      name: task.name,
    },
  };

  dynamoClient.put(params, function (err, data) {
    if (err) {
      let errorMsg =
        "Unable to add item. Error JSON:" + JSON.stringify(err, null, 2);
      console.error(errorMsg);
      responseCode = 400;
      responseMsg = errorMsg;
    } else {
      console.log("Added item:", JSON.stringify(data, null, 2));
    }
  });

  return {
    body: JSON.stringify(responseMsg),
    statusCode: responseCode,
  };
}
