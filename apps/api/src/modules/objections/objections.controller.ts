import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ObjectionsService } from './objections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';

@ApiTags('Objections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('objections')
export class ObjectionsController {
  constructor(private readonly objectionsService: ObjectionsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Objections overview with top categories' })
  async getOverview(
    @TenantId() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.objectionsService.getOverview(tenantId, startDate, endDate);
  }

  @Get('by-period')
  @ApiOperation({ summary: 'Objections count by date and category' })
  async getByPeriod(
    @TenantId() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.objectionsService.getByPeriod(tenantId, startDate, endDate);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List active objection categories' })
  async getCategories(@TenantId() tenantId: string) {
    return this.objectionsService.getCategories(tenantId);
  }

  @Get('drilldown/:category')
  @ApiOperation({ summary: 'Drill-down into a specific objection category' })
  async getDrilldown(
    @TenantId() tenantId: string,
    @Param('category') category: string,
  ) {
    return this.objectionsService.getDrilldown(tenantId, category);
  }
}
