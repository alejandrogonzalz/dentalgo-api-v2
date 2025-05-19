import { FastifyInstance } from 'fastify';
import { CatalogController } from './controller';
import {
	catalogInputSchema,
	catalogParamsSchema,
	type CatalogInput,
	type CatalogParams
} from './dto/index';

export function registerCatalogRoutes(
	fastify: FastifyInstance,
	controller: CatalogController
) {
	// Create Catalog
	fastify.post<{ Body: CatalogInput }>(
		'/catalogs',
		{
			schema: {
				body: catalogInputSchema
			}
		},
		(req, reply) => controller.createCatalog(req, reply)
	);

	// List Catalogs
	fastify.get(
		'/catalogs',
		(req, reply) => controller.getAllCatalogs(req, reply)
	);

	// Get Catalog by ID
	// fastify.get<{ Params: CatalogParams }>(
	// 	'/catalogs/:id',
	// 	{
	// 		schema: {
	// 			params: catalogParamsSchema
	// 		}
	// 	},
	// 	(req, reply) => controller.getCatalog(req, reply)
	// );

	// // Update Catalog
	// fastify.put<{
	// 	Params: CatalogParams;
	// 	Body: Partial<CatalogInput>
	// }>(
	// 	'/catalogs/:id',
	// 	{
	// 		schema: {
	// 			params: catalogParamsSchema,
	// 			body: catalogInputSchema.partial()
	// 		}
	// 	},
	// 	(req, reply) => controller.updateCatalog(req, reply)
	// );
	//
	// // Delete Catalog
	// fastify.delete<{ Params: CatalogParams }>(
	// 	'/catalogs/:id',
	// 	{
	// 		schema: {
	// 			params: catalogParamsSchema
	// 		}
	// 	},
	// 	(req, reply) => controller.deleteCatalog(req, reply)
	// );
}
