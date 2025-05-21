import "source-map-support/register";
import { App } from "aws-cdk-lib";
import { DatabaseStack } from "../lib/database-stack";
import { getConfig } from "../lib/config";
import { LambdaStack } from "../lib/lambda-stack";

const config = getConfig();

const app = new App();

const databaseStack = new DatabaseStack(app, "DatabaseStack", {
	env: {
		region: config.REGION,
		account: config.ACCOUNT_ID,
	},
	config,
});

new LambdaStack(app, 'LambdaStack', {
	env: {
		region: config.REGION,
		account: config.ACCOUNT_ID,
	},
	catalogTable: databaseStack.catalogTable,
});
