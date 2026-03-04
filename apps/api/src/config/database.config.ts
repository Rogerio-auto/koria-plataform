/**
 * Database configuration.
 * TODO: Register with @nestjs/config registerAs
 */

export const databaseConfig = () => ({
  url: process.env.DATABASE_URL,
  schema: 'core',
});
