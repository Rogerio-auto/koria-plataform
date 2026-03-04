/**
 * Drizzle ORM client for PostgreSQL.
 *
 * Uses the `postgres` driver (postgres.js) for connection.
 * All queries operate on the `core` schema.
 *
 * TODO: Initialize with actual DATABASE_URL from environment
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const client = postgres(connectionString);

export const db = drizzle(client, { schema });
