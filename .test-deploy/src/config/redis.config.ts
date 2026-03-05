/**
 * Redis configuration (cache + BullMQ queues).
 * TODO: Register with @nestjs/config registerAs
 */

export const redisConfig = () => ({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});
