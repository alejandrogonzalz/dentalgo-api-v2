import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';

const catalogSchema = z.object({
	id: z.number(),
	service: z.string(),
	price: z.number(),
	description: z.string(),
	file: z.string(),
});

export type Catalog = z.infer<typeof catalogSchema>;

export class CatalogEntity {
	private readonly db: DynamoDBDocument;
	private readonly tableName: string;

	constructor(db: DynamoDBDocument, tableName: string) {
		this.db = db;
		this.tableName = tableName;
	}

	static createClient(): DynamoDBDocument {
		const client = new DynamoDBClient({});
		return DynamoDBDocument.from(client);
	}

	async create(catalog: Omit<Catalog, 'id'>): Promise<Catalog> {
		const id = Date.now(); // Simple ID generation for demo
		const newCatalog = { ...catalog, id };

		await this.db.put({
			TableName: this.tableName,
			Item: newCatalog,
		});

		return catalogSchema.parse(newCatalog);
	}

	async getById(id: number): Promise<Catalog | null> {
		const result = await this.db.get({
			TableName: this.tableName,
			Key: { id },
		});

		return result.Item ? catalogSchema.parse(result.Item) : null;
	}

	async getAll(): Promise<Catalog[]> {
		const result = await this.db.scan({
			TableName: this.tableName,
		});

		return z.array(catalogSchema).parse(result.Items || []);
	}

	async update(id: number, catalog: Partial<Omit<Catalog, 'id'>>): Promise<Catalog | null> {
		const existing = await this.getById(id);
		if (!existing) return null;

		const updatedCatalog = { ...existing, ...catalog };

		await this.db.put({
			TableName: this.tableName,
			Item: updatedCatalog,
		});

		return catalogSchema.parse(updatedCatalog);
	}

	async delete(id: number): Promise<boolean> {
		await this.db.delete({
			TableName: this.tableName,
			Key: { id },
		});

		return true;
	}
}
