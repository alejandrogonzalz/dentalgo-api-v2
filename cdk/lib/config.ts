import * as dotenv from "dotenv";
import path = require("node:path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export type ConfigProps = {
	REGION: string;
	PROFILE: string;
	ENVIRONMENT: string;
	PROJECT_NAME: string;
	ACCOUNT_ID?: string;
};

export const getConfig = (): ConfigProps => ({
	REGION: process.env.REGION || "us-east-2",
	PROFILE: process.env.PROFILE || "default",
	ENVIRONMENT: process.env.ENVIRONMENT || "dev",
	PROJECT_NAME: process.env.PROJECT_NAME || "dentalgo-api",
	ACCOUNT_ID: process.env.ACCOUNT_ID,
});
