/**
 * KorIA Platform API — Entry point
 *
 * Bootstraps the NestJS application with:
 * - Global validation pipe
 * - Swagger/OpenAPI documentation
 * - CORS configuration
 * - API prefix (/api/v1)
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  const apiPrefix = process.env.API_PREFIX || '/api/v1';
  app.setGlobalPrefix(apiPrefix);

  // CORS
  app.enableCors({
    origin: [
      process.env.BRIEFING_FORM_URL || 'http://localhost:5173',
      process.env.DASHBOARD_URL || 'http://localhost:5174',
      process.env.UPLOAD_PORTAL_URL || 'http://localhost:5175',
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('KorIA Platform API')
    .setDescription('API for KorIA Platform — Leads, Briefing, Uploads, Analytics, Payments')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  const port = process.env.API_PORT || 3000;
  await app.listen(port);
  console.warn(`🚀 KorIA API running on port ${port}`);
  console.warn(`📚 Swagger docs at http://localhost:${port}${apiPrefix}/docs`);
}

bootstrap();
