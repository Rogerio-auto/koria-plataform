/**
 * Root application module.
 * Registers all feature modules and global configurations.
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { LeadsModule } from './modules/leads/leads.module';
import { BriefingModule } from './modules/briefing/briefing.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ProductsModule } from './modules/products/products.module';
import { WorkOrdersModule } from './modules/work-orders/work-orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ClickupModule } from './modules/clickup/clickup.module';
import { WebhookModule } from './modules/webhook/webhook.module';

@Module({
  imports: [
    // Global config (loads .env)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    DatabaseModule,

    // Feature modules
    HealthModule,
    AuthModule,
    LeadsModule,
    BriefingModule,
    UploadsModule,
    AnalyticsModule,
    ProductsModule,
    WorkOrdersModule,
    PaymentsModule,

    // Integration modules
    ClickupModule,
    WebhookModule,
  ],
})
export class AppModule {}
