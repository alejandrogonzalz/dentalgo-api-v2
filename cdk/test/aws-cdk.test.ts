import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DatabaseStack } from 'cdk/lib/database-stack';
import { ConfigProps } from 'cdk/lib/config';

describe('DatabaseStack', () => {
	let template: Template;
	const mockConfig: ConfigProps = {
		ENVIRONMENT: 'dev',
		PROJECT_NAME: 'test-project',
		REGION: 'us-east-2',
		ACCOUNT_ID: '123456789012',
		PROFILE: 'default'
	};

	beforeAll(() => {
		const app = new cdk.App();
		const stack = new DatabaseStack(app, 'TestDatabaseStack', {
			config: mockConfig,
			env: {
				region: mockConfig.REGION,
				account: mockConfig.ACCOUNT_ID
			}
		});
		template = Template.fromStack(stack);
	});

	test('creates all required tables', () => {
		template.resourceCountIs('AWS::DynamoDB::Table', 4);
	});

	describe('Users Table', () => {
		test('has correct properties', () => {
			template.hasResourceProperties('AWS::DynamoDB::Table', {
				KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
				BillingMode: 'PAY_PER_REQUEST',
				PointInTimeRecoverySpecification: {
					PointInTimeRecoveryEnabled: true
				},
				SSESpecification: {
					SSEEnabled: true // Explicitly testing default encryption
				}
			});
		});

		test('has email GSI', () => {
			template.hasResourceProperties('AWS::DynamoDB::Table', {
				GlobalSecondaryIndexes: [{
					IndexName: 'byEmail',
					KeySchema: [
						{ AttributeName: 'email', KeyType: 'HASH' }
					],
					Projection: {
						ProjectionType: 'ALL'
					}
				}]
			});
		});

		test('has correct removal policy for dev', () => {
			template.hasResource('AWS::DynamoDB::Table', {
				UpdateReplacePolicy: 'Delete',
				DeletionPolicy: 'Delete'
			});
		});
	});

	describe('Appointments Table', () => {
		test('has composite primary key', () => {
			template.hasResourceProperties('AWS::DynamoDB::Table', {
				KeySchema: [
					{ AttributeName: 'id', KeyType: 'HASH' },
					{ AttributeName: 'startTime', KeyType: 'RANGE' }
				]
			});
		});

		test('has calendar GSI', () => {
			template.hasResourceProperties('AWS::DynamoDB::Table', {
				GlobalSecondaryIndexes: [{
					IndexName: 'byCalendar',
					KeySchema: [
						{ AttributeName: 'calendarId', KeyType: 'HASH' },
						{ AttributeName: 'startTime', KeyType: 'RANGE' }
					]
				}]
			});
		});

		test('has TTL enabled', () => {
			template.hasResourceProperties('AWS::DynamoDB::Table', {
				TimeToLiveSpecification: {
					AttributeName: 'ttl',
					Enabled: true
				}
			});
		});
	});

	describe('Services Table', () => {
		test('has AWS-managed encryption', () => {
			template.hasResourceProperties('AWS::DynamoDB::Table', {
				BillingMode: 'PAY_PER_REQUEST',
				SSESpecification: {
					SSEEnabled: true
				}
			});
		});

		test('has permanent retention', () => {
			template.hasResource('AWS::DynamoDB::Table', {
				UpdateReplacePolicy: 'Retain',
				DeletionPolicy: 'Retain'
			});
		});
	});

	describe('Audit Table', () => {
		test('has composite key with timestamp', () => {
			template.hasResourceProperties('AWS::DynamoDB::Table', {
				KeySchema: [
					{ AttributeName: 'entityType', KeyType: 'HASH' },
					{ AttributeName: 'timestamp', KeyType: 'RANGE' }
				]
			});
		});

		test('has TTL for log rotation', () => {
			template.hasResourceProperties('AWS::DynamoDB::Table', {
				TimeToLiveSpecification: {
					AttributeName: 'expireAt',
					Enabled: true
				}
			});
		});
	});

	describe('Tags', () => {
		// More precise version that checks all tables
		test('all tables have required tags', () => {
			// Get all DynamoDB tables from the template
			const tables = template.findResources('AWS::DynamoDB::Table');

			// Check each table has the required tags
			Object.values(tables).forEach(table => {
				expect(table.Properties.Tags).toEqual(
					expect.arrayContaining([
						{ Key: 'ENVIRONMENT', Value: expect.any(String) },
						{ Key: 'ManagedBy', Value: 'CDK' },
						{ Key: 'Project', Value: expect.any(String) }
					])
				);
			});
		});
	});

	describe('Production Environment', () => {
		let prodTemplate: Template;

		beforeAll(() => {
			const app = new cdk.App();
			const stack = new DatabaseStack(app, 'TestProdDatabaseStack', {
				config: { ...mockConfig, ENVIRONMENT: 'prod' }
			});
			prodTemplate = Template.fromStack(stack);
		});

		test('tables have RETAIN policy in prod', () => {
			prodTemplate.hasResource('AWS::DynamoDB::Table', {
				UpdateReplacePolicy: 'Retain',
				DeletionPolicy: 'Retain'
			});
		});
	});
});
