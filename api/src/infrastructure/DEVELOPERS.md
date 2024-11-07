# Infrastructure

## Purpose

The infrastructure module is responsible for housing all of the infrastructure
code for the application. This includes the database schema, the database
migrations, the database seeding, anything that interacts with the file system,
and anything that interacts with a third-party system or API. Generally
speaking, this is where the application's seams to external systems are.

## Using Drizzle

The infrastructure module uses [Drizzle](https://orm.drizzle.team/) as its ORM.
As such, there are deno tasks that are available to interact with the database.

- deno task tool:drizzle generate --name some-name
- deno task tool:drizzle migrate
- deno task tool:drizzle drop
