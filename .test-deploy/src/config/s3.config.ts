/**
 * S3/R2 storage configuration.
 * TODO: Register with @nestjs/config registerAs
 */

export const s3Config = () => ({
  bucket: process.env.S3_BUCKET,
  region: process.env.S3_REGION || 'auto',
  accessKey: process.env.S3_ACCESS_KEY,
  secretKey: process.env.S3_SECRET_KEY,
  endpoint: process.env.S3_ENDPOINT,
});
