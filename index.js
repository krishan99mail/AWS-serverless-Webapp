const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand, GetCommand, PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

exports.handler = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": event.headers?.origin === "https://frontend-s-hosting123xxx.s3.us-east-1.amazonaws.com" ? "https://frontend-s-hosting123xxx.s3.us-east-1.amazonaws.com" : "http://frontend-s-hosting123xxx.s3-website-us-east-1.amazonaws.com",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "content-type,authorization,accept",
    "Access-Control-Max-Age": "3600"
  };
  console.log("Full event:", JSON.stringify(event, null, 2));

  try {
    if (!event.routeKey) {
      throw new Error(`Missing routeKey: ${JSON.stringify(event)}`);
    }

    switch (event.routeKey) {
      case "DELETE /items/{id}":
        if (!event.pathParameters || !event.pathParameters.id) {
          throw new Error("Missing path parameter: id");
        }
        await dynamo.send(
          new DeleteCommand({
            TableName: "all-items",
            Key: {
              itemId: event.pathParameters.id
            }
          })
        );
        body = `Deleted item ${event.pathParameters.id}`;
        break;
      case "GET /items/{id}":
        if (!event.pathParameters || !event.pathParameters.id) {
          throw new Error("Missing path parameter: id");
        }
        const getResult = await dynamo.send(
          new GetCommand({
            TableName: "all-items",
            Key: {
              itemId: event.pathParameters.id
            }
          })
        );
        body = getResult.Item || {};
        break;
      case "GET /items":
        const scanResult = await dynamo.send(
          new ScanCommand({ TableName: "all-items" })
        );
        body = scanResult.Items || [];
        break;
      case "POST /items":
        if (!event.body) {
          throw new Error("Missing request body");
        }
        let postJSON = JSON.parse(event.body);
        if (!postJSON.itemId || !postJSON.name || !postJSON.price) {
          throw new Error("Missing required fields: itemId, name, price");
        }
        await dynamo.send(
          new PutCommand({
            TableName: "all-items",
            Item: {
              itemId: postJSON.itemId,
              name: postJSON.name,
              price: postJSON.price
            }
          })
        );
        body = `Posted item ${postJSON.itemId}`;
        break;
      case "PUT /items":
        if (!event.body) {
          throw new Error("Missing request body");
        }
        let putJSON = JSON.parse(event.body);
        if (!putJSON.itemId || !putJSON.name || !putJSON.price) {
          throw new Error("Missing required fields: itemId, name, price");
        }
        await dynamo.send(
          new PutCommand({
            TableName: "all-items",
            Item: {
              itemId: putJSON.itemId,
              name: putJSON.name,
              price: putJSON.price
            }
          })
        );
        body = `Updated item ${putJSON.itemId}`;
        break;
      case "OPTIONS /items":
      case "OPTIONS /items/{id}":
        body = "";
        statusCode = 204;
        break;
      default:
        throw new Error(`Unsupported route: ${event.routeKey}`);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
    console.error("Error:", err);
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers
  };
};
