import fastify from 'fastify';
import { CatalogEntity } from './entity';
import { CatalogProvider } from './provider';
import { CatalogController } from './controller';
import { registerCatalogRoutes } from './routes';

export function buildApp() {
	const app = fastify({ logger: true });

	// Initialize dependencies
	const db = CatalogEntity.createClient();
	const tableName = process.env.CATALOG_TABLE_NAME || 'CatalogTable';
	const catalogEntity = new CatalogEntity(db, tableName);
	const catalogProvider = new CatalogProvider(catalogEntity);
	const catalogController = new CatalogController(catalogProvider);

	// Register routes
	registerCatalogRoutes(app, catalogController);

	return app;
}
