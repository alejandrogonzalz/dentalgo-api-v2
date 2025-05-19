import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigw from 'aws-cdk-lib/aws-apigateway'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import type { StackProps } from 'aws-cdk-lib';
import { routes } from "./routes";

type LambdaStackProps = StackProps & {
	catalogTable: dynamodb.Table
};

export class LambdaStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: LambdaStackProps) {
		super(scope, id, props)

		const catalogLambda = new lambda.Function(this, 'CatalogLambda', {
			runtime: lambda.Runtime.NODEJS_20_X,
			code: lambda.Code.fromAsset(routes.CATALOG_LAMBDA),
			handler: 'handler.handler',
			environment: {
				CATALOG_TABLE: props.catalogTable.tableName
			}
		})
		props.catalogTable.grantReadWriteData(catalogLambda)

		// Optional: Add APIs using API Gateway
		new apigw.LambdaRestApi(this, 'CatalogAPI', {
			handler: catalogLambda
		})

	}
}
