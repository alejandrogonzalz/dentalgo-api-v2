import * as cdk from 'aws-cdk-lib';
import { Stack, type StackProps, RemovalPolicy } from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import type { ConfigProps } from './config';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

type AwsEnvStackProps = StackProps & {
	config: Readonly<ConfigProps>;
};

export class DatabaseStack extends Stack {
	public readonly usersTable: dynamodb.Table;
	public readonly appointmentsTable: dynamodb.Table;
	public readonly catalogTable: dynamodb.Table;
	public readonly auditTable: dynamodb.Table;

	constructor(scope: Construct, id: string, props: AwsEnvStackProps) {
		super(scope, id, props);

		const { config } = props;

		// Users Table - Reduced capacity to stay within Free Tier
		this.usersTable = new dynamodb.Table(this, 'UsersTable', {
			tableName: 'UsersTable',
			partitionKey: { name: 'id', type: dynamodb.AttributeType.NUMBER },
			billingMode: dynamodb.BillingMode.PROVISIONED,
			readCapacity: 5,  // Reduced from 20 to 5
			writeCapacity: 5, // Reduced from 20 to 5
			removalPolicy: config.ENVIRONMENT === 'prod'
				? RemovalPolicy.RETAIN
				: RemovalPolicy.DESTROY,
		});

		// GSI with reduced capacity
		this.usersTable.addGlobalSecondaryIndex({
			indexName: 'byEmail',
			partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
			projectionType: dynamodb.ProjectionType.ALL,
			readCapacity: 5,  // Reduced from 20 to 5
			writeCapacity: 5  // Reduced from 20 to 5
		});

		// Appointments Table - Reduced capacity
		this.appointmentsTable = new dynamodb.Table(this, 'AppointmentsTable', {
			tableName: 'AppointmentsTable',
			partitionKey: { name: 'id', type: dynamodb.AttributeType.NUMBER },
			sortKey: { name: 'startTime', type: dynamodb.AttributeType.STRING },
			billingMode: dynamodb.BillingMode.PROVISIONED,
			readCapacity: 5,  // Reduced from 20 to 5
			writeCapacity: 5, // Reduced from 20 to 5
			removalPolicy: config.ENVIRONMENT === 'prod'
				? RemovalPolicy.RETAIN
				: RemovalPolicy.DESTROY,
			timeToLiveAttribute: 'ttl',
		});

		// GSI with reduced capacity
		this.appointmentsTable.addGlobalSecondaryIndex({
			indexName: 'byCalendar',
			partitionKey: { name: 'calendarId', type: dynamodb.AttributeType.STRING },
			sortKey: { name: 'startTime', type: dynamodb.AttributeType.STRING },
			projectionType: dynamodb.ProjectionType.ALL,
			readCapacity: 5,  // Explicitly set to 5
			writeCapacity: 5  // Explicitly set to 5
		});

		// CatalogTable - Reduced capacity
		this.catalogTable = new dynamodb.Table(this, 'CatalogTable', {
			tableName: 'CatalogTable',
			partitionKey: { name: 'id', type: dynamodb.AttributeType.NUMBER },
			billingMode: dynamodb.BillingMode.PROVISIONED,
			readCapacity: 5,  // Reduced from 20 to 5
			writeCapacity: 5, // Reduced from 20 to 5
			removalPolicy: config.ENVIRONMENT === 'prod'
				? RemovalPolicy.RETAIN
				: RemovalPolicy.DESTROY,
		});

		// Audit Table - Reduced capacity
		this.auditTable = new dynamodb.Table(this, 'AuditTable', {
			partitionKey: { name: 'entityType', type: dynamodb.AttributeType.STRING },
			sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
			billingMode: dynamodb.BillingMode.PROVISIONED,
			readCapacity: 5,  // Reduced from 20 to 5
			writeCapacity: 5, // Reduced from 20 to 5
			removalPolicy: config.ENVIRONMENT === 'prod'
				? RemovalPolicy.RETAIN
				: RemovalPolicy.DESTROY,
			timeToLiveAttribute: 'expireAt',
		});

		// Add tags to all resources
		cdk.Tags.of(this).add('ENVIRONMENT', config.ENVIRONMENT);
		cdk.Tags.of(this).add('ManagedBy', 'CDK');
		cdk.Tags.of(this).add('Project', config.PROJECT_NAME);
	}
}
