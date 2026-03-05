/**
 * JWT configuration.
 * TODO: Register with @nestjs/config registerAs
 */

export const jwtConfig = () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
});
