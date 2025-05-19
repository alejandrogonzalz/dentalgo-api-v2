# Modular Fastify + AWS Lambda Backend Architecture

This project implements a modular, cleanly layered Fastify + AWS Lambda backend, organized by domain (e.g., users, appointments, catalog).

## Domain Structure and Layers
Each domain follows a consistent, clear structure consisting of the following layers:

* ### Entity Layer
Responsible for direct interactions with DynamoDB (CRUD operations, queries, etc.). This layer abstracts away all database-specific details.

### Business Logic Layer (Provider)
Handles the core application logic, orchestrating data access through entities and applying business rules. This layer is named provider instead of the typical “service” for clearer semantics.

* ### Controller Layer
Manages Fastify request and response handling. Controllers invoke provider methods and send appropriate HTTP responses.

* ### Routes and App Setup
Defines Fastify routes per domain and builds the Fastify instance.

* ### Lambda Handler
Wraps the Fastify app using aws-lambda-fastify to deploy each domain as an isolated AWS Lambda function behind API Gateway.

This architecture promotes granular, modular, and maintainable code by clearly separating concerns and allowing each domain to be independently testable and deployable.

----

## Replication Across Domains
This structure is applied consistently across all domains such as users, appointments, and catalog. Each domain can have environment-aware configurations (e.g., for dev/prod), and each is deployed as a standalone Lambda function.

### Example Modular Structure for catalog Domain
```
src/
└── catalog/
    ├── entity/
    │   └── catalog.entity.ts      # DynamoDB interface layer
    ├── provider/
    │   └── catalog.provider.ts    # Business logic layer
    ├── controller/
    │   └── catalog.controller.ts  # Fastify HTTP handlers
    ├── routes.ts                  # Fastify route registrations
    ├── app.ts                    # Fastify app builder
    └── handler.ts                # Lambda handler entrypoint
```

### Layer Interaction Flow
1. Lambda Handler receives AWS API Gateway event →

2. Fastify app routes the request to the controller →

3. Controller invokes the provider for business logic →

4. Provider calls the entity to interact with DynamoDB →

5. Data flows back through provider → controller → client response.
