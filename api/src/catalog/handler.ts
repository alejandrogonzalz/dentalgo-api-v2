import awsLambdaFastify from '@fastify/aws-lambda';
import { buildApp } from './app';

const app = buildApp();
const proxy = awsLambdaFastify(app);

export const handler = proxy;
