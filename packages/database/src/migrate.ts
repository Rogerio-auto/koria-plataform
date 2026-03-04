/**
 * Database migration runner.
 *
 * TODO: Implement migration logic using drizzle-kit
 * This file will be used for programmatic migration execution.
 */

import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from './client';

async function runMigrations() {
  console.warn('Running migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.warn('Migrations complete.');
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
