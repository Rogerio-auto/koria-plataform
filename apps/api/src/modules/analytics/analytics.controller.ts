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

  @Get('conversion-rates')
  @ApiOperation({ summary: 'Conversion rates through the funnel' })
  async getConversionRates(
    @TenantId() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getConversionRates(tenantId, startDate, endDate);
  }

  @Get('average-ticket')
  @ApiOperation({ summary: 'Average ticket value with variation' })
  async getAverageTicket(
    @TenantId() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getAverageTicket(tenantId, startDate, endDate);
  }

  @Get('funnel-by-pipeline')
  @ApiOperation({ summary: 'Funnel data broken down by pipeline' })
  async getFunnelByPipeline(
    @TenantId() tenantId: string,
    @Query('pipelineId') pipelineId?: string,
  ) {
    return this.analyticsService.getFunnelByPipeline(tenantId, pipelineId);
  }

  @Get('lead-sources')
  @ApiOperation({ summary: 'Lead acquisition sources' })
  async getLeadSources(
    @TenantId() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getLeadSources(tenantId, startDate, endDate);
  }

  @Get('channels-distribution')
  @ApiOperation({ summary: 'Contact channels distribution' })
  async getChannelsDistribution(@TenantId() tenantId: string) {
    return this.analyticsService.getChannelsDistribution(tenantId);
  }

  @Get('quote-funnel')
  @ApiOperation({ summary: 'Quote status funnel' })
  async getQuoteFunnel(
    @TenantId() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getQuoteFunnel(tenantId, startDate, endDate);
  }

  @Get('work-order-status')
  @ApiOperation({ summary: 'Work order status distribution and overdue count' })
  async getWorkOrderStatus(@TenantId() tenantId: string) {
    return this.analyticsService.getWorkOrderStatus(tenantId);
  }

  @Get('briefing-completion')
  @ApiOperation({ summary: 'Briefing form completion rate' })
  async getBriefingCompletion(@TenantId() tenantId: string) {
    return this.analyticsService.getBriefingCompletion(tenantId);
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Recent events feed' })
  async getRecentActivity(
    @TenantId() tenantId: string,
    @Query('limit') limit?: string,
  ) {
    return this.analyticsService.getRecentActivity(tenantId, limit ? parseInt(limit, 10) : 20);
  }

  @Get('pipeline-performance')
  @ApiOperation({ summary: 'Full pipeline performance analytics' })
  async getPipelinePerformance(
    @TenantId() tenantId: string,
    @Query('pipelineId') pipelineId: string,
  ) {
    return this.analyticsService.getPipelinePerformance(tenantId, pipelineId);
  }
}
