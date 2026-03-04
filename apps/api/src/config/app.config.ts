/**
 * Application configuration.
 * TODO: Register with @nestjs/config registerAs
 */

export const appConfig = () => ({
  port: parseInt(process.env.API_PORT || '3000', 10),
  prefix: process.env.API_PREFIX || '/api/v1',
  nodeEnv: process.env.NODE_ENV || 'development',
  defaultTenantId: process.env.DEFAULT_TENANT_ID,
});
