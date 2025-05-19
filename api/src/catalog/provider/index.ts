import { type Catalog, CatalogEntity } from '@src/catalog/entity';
import { z } from 'zod';

const createCatalogSchema = z.object({
	service: z.string(),
	price: z.number(),
	description: z.string(),
	file: z.string(),
});

export class CatalogProvider {
	constructor(private readonly catalogEntity: CatalogEntity) {}

	async createCatalog(input: unknown): Promise<Catalog> {
		const validated = createCatalogSchema.parse(input);
		return this.catalogEntity.create(validated);
	}

	async getCatalog(id: number): Promise<Catalog | null> {
		return this.catalogEntity.getById(id);
	}

	async listCatalogs(): Promise<Catalog[]> {
		return this.catalogEntity.getAll();
	}

	async updateCatalog(id: number, input: unknown): Promise<Catalog | null> {
		const validated = createCatalogSchema.partial().parse(input);
		return this.catalogEntity.update(id, validated);
	}

	async deleteCatalog(id: number): Promise<boolean> {
		return this.catalogEntity.delete(id);
	}
}
