# DentalGo API & CDK

## **Overview**
A scalable, serverless backend for managing appointments, services, and users, built with AWS CDK for infrastructure-as-code and Fastify for high-performance API routes. The system is designed for reliability, cost-efficiency, and easy deployment, with separate AWS Lambda functions per domain (users, appointments, services) and DynamoDB for flexible data storage.

### Key features

1. **Infrastructure (CDK)**
* Backend Stack: Defines DynamoDB tables with encryption, backups, and fine-grained access controls.
* API Stack: Deploys API Gateway with Lambda integrations (one per service).
* Environment-Aware: Configures dev/prod settings (e.g., TTL, memory size).

2. **API Layer (Fastify Lambdas)**
* Backend Stack: Defines DynamoDB tables with encryption, backups, and fine-grained access controls.
* API Stack: Deploys API Gateway with Lambda integrations (one per service).
* Environment-Aware: Configures dev/prod settings (e.g., TTL, memory size).

3. **API Layer (Fastify Lambdas)**
* Per-Service Isolation:
  * users/: CRUD operations with JWT auth (planned)
* appointments/: Time-based queries with DynamoDB GSIs
  * services/: Catalog management with file attachments
* Optimized for Serverless:
  * Cold-start mitigation via aws-lambda-fastify
  *Shared DynamoDB client for connection pooling

4. ** CI/CD (GitHub Actions)**
   * Unified Testing: Runs CDK assertions + API integration tests in parallel.
   * Safe Deployments:
     * Infra deploys first → API deploys after (with dependency checks).
     * Rollback workflows on failure.

----
## **Prerequisites**
1. **Install nvm (Node Version Manager)**

   If you haven't installed nvm, follow the official guide:
   https://github.com/nvm-sh/nvm#installing-and-updating


2. **Use Node.js 20**

   `$ nvm install 20`
   `$ nvm use 20`


3. **Use pnpm instead of npm**

   Install pnpm globally:
   `$ npm install -g pnpm`

   Then, install dependencies with pnpm:
   `$ pnpm install`


4. **Install the AWS CLI in your machine**

   If you haven't installed the AWS CLI, follow the official guide:
   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html


5. **Configure security credentials for the AWS CDK CLI**

   In order to configure the credentials of your AWS in the CLI, you can do one of the listed here: https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-authentication.html

   This way is the easiest one: https://docs.aws.amazon.com/cli/latest/userguide/cli-authentication-user.html

## Useful commands
The `cdk.json` file tells the CDK Toolkit how to execute your app.

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
