import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { LambdaStack } from "cdk/lib/lambda-stack";
import { Match, Template } from "aws-cdk-lib/assertions";

describe('LambdaStack', () => {
	test('LambdaStack creates a Lambda function and API Gateway', () => {
		const app = new cdk.App();

		// Create a mock DynamoDB table in a separate stack to pass to LambdaStack
		const stackWithTable = new cdk.Stack(app, 'MockTableStack');
		const mockTable = new dynamodb.Table(stackWithTable, 'MockCatalogTable', {
			partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
			billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
		});

		// Create the actual stack under test, passing the mock table
		const stack = new LambdaStack(app, 'TestLambdaStack', {
			catalogTable: mockTable,
		});

		const template = Template.fromStack(stack);

		// Check that a Lambda function was created with expected properties
		template.hasResourceProperties('AWS::Lambda::Function', {
			Handler: 'handler.handler',
			Runtime: 'nodejs20.x',
			Environment: {
				Variables: {
					CATALOG_TABLE: Match.anyValue(), // or Match.stringLikeRegexp('.*MockCatalogTable.*') but Match.anyValue() is enough
				},
			},
		});

		// Check that an API Gateway REST API is created
		template.hasResourceProperties('AWS::ApiGateway::RestApi', {
			Name: Match.stringLikeRegexp('CatalogAPI'),
		});
	});

});
