#!/usr/bin/env node
import "source-map-support/register";
import { App } from "aws-cdk-lib";
import { DatabaseStack } from "../lib/database-stack";
import { getConfig } from "../lib/config";

const config = getConfig();

const app = new App();

// Deploy the database stack
new DatabaseStack(app, "DatabaseStack", {
	env: {
		region: config.REGION,
		account: config.ACCOUNT_ID,
	},
	config,
});
