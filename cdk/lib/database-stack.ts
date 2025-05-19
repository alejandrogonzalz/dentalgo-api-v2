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

		// Users Table
		this.usersTable = new dynamodb.Table(this, 'UsersTable', {
			partitionKey: { name: 'id', type: dynamodb.AttributeType.NUMBER },
			billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
			pointInTimeRecoverySpecification: {
				pointInTimeRecoveryEnabled: true,
				recoveryPeriodInDays: 35,
			},
			removalPolicy: config.ENVIRONMENT === 'prod'
				? RemovalPolicy.RETAIN
				: RemovalPolicy.DESTROY,
		});

		// Add email as a Global Secondary Index for user lookup
		this.usersTable.addGlobalSecondaryIndex({
			indexName: 'byEmail',
			partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
			projectionType: dynamodb.ProjectionType.ALL,
		});

		// Appointments Table
		this.appointmentsTable = new dynamodb.Table(this, 'AppointmentsTable', {
			partitionKey: { name: 'id', type: dynamodb.AttributeType.NUMBER },
			sortKey: { name: 'startTime', type: dynamodb.AttributeType.STRING },
			billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
			pointInTimeRecoverySpecification: {
				pointInTimeRecoveryEnabled: true,
				recoveryPeriodInDays: 35,
			},
			removalPolicy: config.ENVIRONMENT === 'prod'
				? RemovalPolicy.RETAIN
				: RemovalPolicy.DESTROY,
			timeToLiveAttribute: 'ttl',
		});

		// Index for appointments by calendar
		this.appointmentsTable.addGlobalSecondaryIndex({
			indexName: 'byCalendar',
			partitionKey: { name: 'calendarId', type: dynamodb.AttributeType.STRING },
			sortKey: { name: 'startTime', type: dynamodb.AttributeType.STRING },
			projectionType: dynamodb.ProjectionType.ALL,
		});

		// CatalogTable Table
		this.catalogTable = new dynamodb.Table(this, 'CatalogTable', {
			partitionKey: { name: 'id', type: dynamodb.AttributeType.NUMBER },
			billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
			encryption: dynamodb.TableEncryption.AWS_MANAGED,
			pointInTimeRecoverySpecification: {
				pointInTimeRecoveryEnabled: true,
				recoveryPeriodInDays: 35,
			},
			removalPolicy: RemovalPolicy.RETAIN,
		});

		// Audit Table
		this.auditTable = new dynamodb.Table(this, 'AuditTable', {
			partitionKey: { name: 'entityType', type: dynamodb.AttributeType.STRING },
			sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
			billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
			encryption: dynamodb.TableEncryption.AWS_MANAGED,
			pointInTimeRecoverySpecification: {
				pointInTimeRecoveryEnabled: true,
				recoveryPeriodInDays: 35,
			},
			removalPolicy: RemovalPolicy.RETAIN,
			timeToLiveAttribute: 'expireAt',
		});

		// Add tags to all resources
		cdk.Tags.of(this).add('ENVIRONMENT', config.ENVIRONMENT);
		cdk.Tags.of(this).add('ManagedBy', 'CDK');
		cdk.Tags.of(this).add('Project', config.PROJECT_NAME);
	}
}
