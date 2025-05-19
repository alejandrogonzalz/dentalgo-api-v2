import { FastifyRequest, FastifyReply } from 'fastify';
import { CatalogProvider } from '@src/catalog/provider';

export class CatalogController {
	constructor(private readonly catalogProvider: CatalogProvider) {}

	async createCatalog(
		request: FastifyRequest<{ Body: unknown }>,
		reply: FastifyReply
	) {
		try {
			const catalog = await this.catalogProvider.createCatalog(request.body);
			reply.code(201).send(catalog);
		} catch (error) {
			reply.code(400).send({ error: 'Invalid input' });
		}
	}

	async getCatalog(
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply
	) {
		const id = parseInt(request.params.id, 10);
		const catalog = await this.catalogProvider.getCatalog(id);

		if (!catalog) {
			reply.code(404).send({ error: 'Catalog not found' });
			return;
		}

		reply.send(catalog);
	}

	async getAllCatalogs(request: FastifyRequest, reply: FastifyReply) {
		const catalogs = await this.catalogProvider.listCatalogs();
		reply.send(catalogs);
	}

	async updateCatalog(
		request: FastifyRequest<{ Params: { id: string }; Body: unknown }>,
		reply: FastifyReply
	) {
		const id = parseInt(request.params.id, 10);
		try {
			const catalog = await this.catalogProvider.updateCatalog(id, request.body);

			if (!catalog) {
				reply.code(404).send({ error: 'Catalog not found' });
				return;
			}

			reply.send(catalog);
		} catch (error) {
			reply.code(400).send({ error: 'Invalid input' });
		}
	}

	async deleteCatalog(
		request: FastifyRequest<{ Params: { id: string } }>,
		reply: FastifyReply
	) {
		const id = parseInt(request.params.id, 10);
		await this.catalogProvider.deleteCatalog(id);
		reply.code(204).send();
	}
}
