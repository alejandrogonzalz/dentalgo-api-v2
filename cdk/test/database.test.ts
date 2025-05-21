import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DatabaseStack } from 'cdk/lib/database-stack';
import { ConfigProps } from 'cdk/lib/config';

// Mock configuration
const mockConfig: ConfigProps = {
	PROFILE: 'test',
	ENVIRONMENT: 'test',
	PROJECT_NAME: 'TestProject',
	REGION: 'us-east-2',
	ACCOUNT_ID: '123456789012'
};

describe('DatabaseStack', () => {
	let template: cdk.assertions.Template;

	beforeAll(() => {
		const app = new cdk.App();
		const stack = new DatabaseStack(app, 'TestDatabaseStack', {
			env: {
				account: mockConfig.ACCOUNT_ID,
				region: mockConfig.REGION
			},
			config: mockConfig
		});
		template = Template.fromStack(stack);
	});

	test('creates 4 DynamoDB tables', () => {
		template.resourceCountIs('AWS::DynamoDB::Table', 4);
	});

	describe('UsersTable', () => {
		test('has correct properties', () => {
			template.hasResourceProperties('AWS::DynamoDB::Table', {
				TableName: 'UsersTable',
				KeySchema: [
					{
						AttributeName: 'id',
						KeyType: 'HASH'
					}
				],
				ProvisionedThroughput: {
					ReadCapacityUnits: 5,
					WriteCapacityUnits: 5
				},
				AttributeDefinitions: [
					{
						AttributeName: 'id',
						AttributeType: 'N'
					},
					{
						AttributeName: 'email',
						AttributeType: 'S'
					}
				],
				GlobalSecondaryIndexes: [
					{
						IndexName: 'byEmail',
						KeySchema: [
							{
								AttributeName: 'email',
								KeyType: 'HASH'
							}
						],
						Projection: {
							ProjectionType: 'ALL'
						},
						ProvisionedThroughput: {
							ReadCapacityUnits: 5,
							WriteCapacityUnits: 5
						}
					}
				]
			});
		});

		test('has correct removal policy', () => {
			template.hasResource('AWS::DynamoDB::Table', {
				UpdateReplacePolicy: 'Delete',
				DeletionPolicy: 'Delete'
			});
		});
	});

	describe('AppointmentsTable', () => {
		test('has correct properties', () => {
			template.hasResourceProperties('AWS::DynamoDB::Table', {
				TableName: 'AppointmentsTable',
				KeySchema: [
					{
						AttributeName: 'id',
						KeyType: 'HASH'
					},
					{
						AttributeName: 'startTime',
						KeyType: 'RANGE'
					}
				],
				ProvisionedThroughput: {
					ReadCapacityUnits: 5,
					WriteCapacityUnits: 5
				},
				TimeToLiveSpecification: {
					AttributeName: 'ttl',
					Enabled: true
				}
			});
		});
	});

	describe('CatalogTable', () => {
		test('has correct properties', () => {
			template.hasResourceProperties('AWS::DynamoDB::Table', {
				TableName: 'CatalogTable',
				KeySchema: [
					{
						AttributeName: 'id',
						KeyType: 'HASH'
					}
				],
				ProvisionedThroughput: {
					ReadCapacityUnits: 5,
					WriteCapacityUnits: 5
				}
			});
		});
	});

	describe('AuditTable', () => {
		test('has correct properties', () => {
			template.hasResourceProperties('AWS::DynamoDB::Table', {
				KeySchema: [
					{
						AttributeName: 'entityType',
						KeyType: 'HASH'
					},
					{
						AttributeName: 'timestamp',
						KeyType: 'RANGE'
					}
				],
				ProvisionedThroughput: {
					ReadCapacityUnits: 5,
					WriteCapacityUnits: 5
				},
				TimeToLiveSpecification: {
					AttributeName: 'expireAt',
					Enabled: true
				}
			});
		});
	});

	test('has correct tags', () => {
		template.hasResourceProperties('AWS::DynamoDB::Table', {
			Tags: [
				{
					Key: 'ENVIRONMENT',
					Value: 'test'
				},
				{
					Key: 'ManagedBy',
					Value: 'CDK'
				},
				{
					Key: 'Project',
					Value: 'TestProject'
				}
			]
		});
	});
});
