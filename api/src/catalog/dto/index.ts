import { z } from 'zod';

export const catalogInputSchema = z.object({
	service: z.string(),
	price: z.number(),
	description: z.string(),
	file: z.string(),
});

export const catalogParamsSchema = z.object({
	id: z.string()
});

export type CatalogInput = z.infer<typeof catalogInputSchema>;
export type CatalogParams = z.infer<typeof catalogParamsSchema>;
