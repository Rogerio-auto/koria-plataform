import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Dashboard overview metrics' })
  async getOverview() {
    // TODO: Aggregate metrics from multiple tables
    return { message: 'Overview — not yet implemented' };
  }

  @Get('funnel')
  @ApiOperation({ summary: 'Lead funnel data' })
  async getFunnel(@Query() _query: unknown) {
    // TODO: Query vw_lead_funnel_current
    return { message: 'Funnel — not yet implemented' };
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Revenue metrics by period' })
  async getRevenue(@Query() _query: unknown) {
    // TODO: Aggregate from payment_intents
    return { message: 'Revenue — not yet implemented' };
  }

  @Get('ai-costs')
  @ApiOperation({ summary: 'AI execution costs' })
  async getAiCosts(@Query() _query: unknown) {
    // TODO: Aggregate from ai_runs
    return { message: 'AI costs — not yet implemented' };
  }

  @Get('errors')
  @ApiOperation({ summary: 'System errors summary' })
  async getErrors(@Query() _query: unknown) {
    // TODO: Query errors table
    return { message: 'Errors — not yet implemented' };
  }
}
