import {Stack, Duration, BundlingFileAccess } from 'aws-cdk-lib'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { LambdaIntegration ,RestApi } from 'aws-cdk-lib/aws-apigateway'
import { NodejsFunction, OutputFormat } from "aws-cdk-lib/aws-lambda-nodejs";
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as budgets from 'aws-cdk-lib/aws-budgets';
import { Construct } from 'constructs'
import { routes } from "./routes";
import type { StackProps } from 'aws-cdk-lib';
import type { ConfigProps } from "cdk/lib/config";

type LambdaStackProps = StackProps & {
	catalogTable: dynamodb.Table;
	config?: Readonly<ConfigProps>;
};

export class LambdaStack extends Stack {
	constructor(scope: Construct, id: string, props: LambdaStackProps) {
		super(scope, id, props);

		const { config } = props;

		const nodeModules = [
			'@fastify/aws-lambda',
			'fastify',
			'zod',
			'@aws-sdk/client-dynamodb',
			'@aws-sdk/lib-dynamodb'
		];

		const fastifyFn = new NodejsFunction(this, 'CatalogLambda', {
			functionName: `catalog-api-lambda-${config?.ENVIRONMENT ?? 'dev'}`,
			entry: routes.CATALOG_LAMBDA,
			runtime: Runtime.NODEJS_20_X,
			memorySize: 128,
			timeout: Duration.seconds(10),
			bundling: {
				nodeModules,
				format: OutputFormat.ESM,
				target: 'es2020',
				sourceMap: true,
				// bundlingFileAccess: BundlingFileAccess.VOLUME_COPY, // Add this line
				// commandHooks: {
				// 	afterBundling(inputDir: string, outputDir: string) {
				// 		return [
				// 			`chmod -R 755 ${outputDir}`, // Ensure permissions
				// 			`cd ${outputDir}`,
				// 			'npm install',
				// 		],
				// 	}
				// }
			},
			environment: {
				CATALOG_TABLE: props.catalogTable.tableName,
				NODE_OPTIONS: '--enable-source-maps',
			},
		});

		props.catalogTable.grantReadWriteData(fastifyFn);

		const api = new RestApi(this, 'CatalogAPI', {
			restApiName: 'CatalogAPI',
		});
		const lambdaIntegration = new LambdaIntegration(fastifyFn);
		api.root.addMethod('ANY', lambdaIntegration, {
			apiKeyRequired: false,
		});

		new budgets.CfnBudget(this, 'FreeTierBudget', {
			budget: {
				budgetType: 'COST',
				timeUnit: 'MONTHLY',
				budgetLimit: {
					amount: 1,
					unit: 'USD',
				},
				costFilters: {
					Service: ['Lambda', 'DynamoDB', 'APIGateway'],
				},
			},
			notificationsWithSubscribers: [
				{
					notification: {
						threshold: 10, // Alert at $0.01 (100% of $0)
						notificationType: 'ACTUAL',
						comparisonOperator: 'GREATER_THAN',
					},
					subscribers: [{
						subscriptionType: 'EMAIL',
						address: 'your-email@example.com',
					}],
				},
			],
		});
	}
}
