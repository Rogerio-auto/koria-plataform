import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Dashboard overview KPIs with variation' })
  async getOverview(
    @TenantId() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getOverview(tenantId, startDate, endDate);
  }

  @Get('funnel')
  @ApiOperation({ summary: 'Lead funnel data by pipeline stages' })
  async getFunnel(@TenantId() tenantId: string) {
    return this.analyticsService.getFunnel(tenantId);
  }

  @Get('leads-by-period')
  @ApiOperation({ summary: 'Leads count by date for chart' })
  async getLeadsByPeriod(
    @TenantId() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getLeadsByPeriod(tenantId, startDate, endDate);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Revenue metrics by period' })
  async getRevenue(
    @TenantId() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getRevenue(tenantId, startDate, endDate);
  }

  @Get('ai-costs')
  @ApiOperation({ summary: 'AI execution costs' })
  async getAiCosts(
    @TenantId() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getAiCosts(tenantId, startDate, endDate);
  }

  @Get('errors')
  @ApiOperation({ summary: 'System errors summary' })
  async getErrors(
    @TenantId() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getErrors(tenantId, startDate, endDate);
  }

  @Get('followup-rate')
  @ApiOperation({ summary: 'Follow-up conversion rate' })
  async getFollowupRate(@TenantId() tenantId: string) {
    return this.analyticsService.getFollowupConversionRate(tenantId);
  }
}
