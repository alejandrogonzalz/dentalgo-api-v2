import { Stack, type StackProps } from "aws-cdk-lib";
import type { Construct } from "constructs";
import type { ConfigProps } from "./config";

type AwsEnvStackProps = StackProps & {
	config: Readonly<ConfigProps>;
};

export class APIStack extends Stack {
	constructor(scope: Construct, id: string, props: AwsEnvStackProps) {
		super(scope, id, props);

		const { config } = props;

		// The code that defines your stack goes here
		// example resource
		// const queue = new sqs.Queue(this, 'AwsCdkQueue', {
		//   visibilityTimeout: cdk.Duration.seconds(300)
		// });
	}
}
