Items Data Store Project

This project uses S3, API Gateway, Lambda, DynamoDB, and SQS, with deployment options for manual setup or CloudFormation.
Live Demo: http://frontend-s-hosting123xxx.s3-website-us-east-1.amazonaws

Project Overview
The Items Data Store Project allows users to perform CRUD operations via a static S3-hosted frontend. Key components:

Frontend: S3 bucket frontend-s-hosting123xxx with index.html.
Backend: API Gateway (items-api, ID: 4egmvbn6e6) and Node.js Lambda.
Database: DynamoDB table all-items.
Async Processing: SQS queue items-async-queue.

Prerequisites

AWS account (free tier).
AWS CLI (aws configure).
Node.js and npm.
Text editor (e.g., VS Code).
Git installed.

Setup Instructions
Option 1: Manual Setup

S3 Bucket:
Create frontend-s-hosting123xx (us-east-1).
Enable static website hosting, set index.html.
Upload index.html (see frontend/ directory).
Add public policy and CORS:{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["GET"],
  "AllowedOrigins": ["https://frontend-s-hosting123xxx.s3.us-east-1.amazonaws.com"],
  "MaxAgeSeconds": 3000
}




DynamoDB: Create table all-items, partition key itemId (String).
SQS: Create queue items-async-queue.
Lambda: Create "WebApp-ItemLambdaFunction" (Node.js 18.x), add IAM role.
API Gateway: Create HTTP API items-api, add routes, enable CORS, deploy to prod.
Test: Update index.html API URL, test in browser.

Option 2: CloudFormation Setup

Clone repository:git clone https://github.com/xxxxxxxxxxxx/AWS-serverless-Webapp.git
cd items-data-store


Deploy template.yaml:aws cloudformation deploy --template-file template.yaml --stack-name 
ItemsDataStoreStack --capabilities CAPABILITY_IAM --region us-east-1


Upload frontend:aws s3 sync frontend/ s3://frontend-s-hosting123xxx --region us-east-1


Test at http://frontend-s-hosting123xxx.s3-website-us-east-1.amazonaws.com.



Template.yaml
AWSTemplateFormatVersion: '2010-09-09'
Resources:
  S3Bucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: frontend-s-hosting123456x
      WebsiteConfiguration:
        IndexDocument: index.html
      CorsConfiguration:
        CorsRules:
          - AllowedHeaders: ['*']
            AllowedMethods: ['GET']
            AllowedOrigins: ['https://frontend-s-hosting123xxx.s3.us-east-1.amazonaws.com']
  ItemsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: all-items
      AttributeDefinitions:
        - AttributeName: itemId
          AttributeType: S
      KeySchema:
        - AttributeName: itemId
          KeyType: HASH
      BillingMode: PAY_PER_REQUEST
  ItemsQueue:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: items-async-queue
  ItemsLambda:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: WebApp-ItemLambdaFunction
      Runtime: nodejs18.x
      Handler: index.handler
      Code:
        ZipFile: |
          exports.handler = async (event) => {
            return {
              statusCode: 200,
              headers: { "Access-Control-Allow-Origin": "*" },
              body: JSON.stringify("Hello from Lambda!")
            };
          }
      Role: !GetAtt LambdaExecutionRole.Arn
  LambdaExecutionRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
            Action: sts:AssumeRole
      Policies:
        - PolicyName: LambdaPolicy
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action:
                  - logs:*
                  - dynamodb:*
                  - sqs:*
                Resource: '*'
  ItemsApi:
    Type: AWS::ApiGatewayV2::Api
    Properties:
      Name: items-api
      ProtocolType: HTTP
      CorsConfiguration:
        AllowOrigins:
          - http://frontend-s-hosting123xxx.s3-website-us-east-1.amazonaws.com
          - https://frontend-s-hosting123xxx.s3.us-east-1.amazonaws.com
        AllowMethods: ['GET', 'POST', 'PUT', 'DELETE']
        AllowHeaders: ['Content-Type']
  ApiStage:
    Type: AWS::ApiGatewayV2::Stage
    Properties:
      ApiId: !Ref ItemsApi
      StageName: prod
      AutoDeploy: true
Outputs:
  ApiUrl:
    Value: !Sub 'https://${ItemsApi}.execute-api.${AWS::Region}.amazonaws.com/prod'
  WebsiteUrl:
    Value: !Sub 'http://${S3Bucket}.s3-website-${AWS::Region}.amazonaws.com'




    

Troubleshooting

CORS Error:
Check index.html API URL includes /prod.
Verify template.yaml CORS settings.
Add S3 CORS policy.


403 Errors: Ensure S3 bucket policy allows public GetObject.
Lambda Errors: Check IAM role permissions.
YAML Errors: Use linter, validate syntax.

Usage

Open http://frontend-s-hosting123xxx.s3-website-us-east-1.amazonaws.com.
Add item (e.g., itemId: 001, name: Book, price: 10).
Update or delete items.
Check DynamoDB all-items and SQS logs.

Contributing
Submit issues or pull requests at GitHub.
License
MIT License.
Contact
AHM Krishan - [krishanqatarx@gmail.com]

