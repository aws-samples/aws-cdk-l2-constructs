var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// asset-input/cdkBlogL2Stack/api/runtime/infrastructure.handler.ts
var infrastructure_handler_exports = {};
__export(infrastructure_handler_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(infrastructure_handler_exports);
var import_aws_sdk = require("aws-sdk");
var import_process = require("process");
async function handler(event) {
  console.log("event:", event);
  var responseCode = 200;
  var responseMsg = "Ok";
  if (!event.body) {
    return {
      body: JSON.stringify("No body sent"),
      statusCode: 400
    };
  }
  const task = JSON.parse(event.body);
  const dynamoClient = new import_aws_sdk.DynamoDB.DocumentClient();
  var params = {
    TableName: import_process.env.TABLE_NAME,
    Item: {
      id: task.id,
      name: task.name
    }
  };
  dynamoClient.put(params, function(err, data) {
    if (err) {
      var errorMsg = "Unable to add item. Error JSON:" + JSON.stringify(err, null, 2);
      console.error(errorMsg);
      responseCode = 400;
      responseMsg = errorMsg;
    } else {
      console.log("Added item:", JSON.stringify(data, null, 2));
    }
  });
  return {
    body: JSON.stringify(responseMsg),
    statusCode: responseCode
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
