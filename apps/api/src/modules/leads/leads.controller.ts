import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';

@ApiTags('Leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'List leads (paginated, filterable)' })
  async findAll(
    @TenantId() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('pipelineId') pipelineId?: string,
    @Query('stageId') stageId?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.leadsService.findAll(tenantId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      status,
      pipelineId,
      stageId,
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lead by ID with contacts, stages, qualification' })
  async findOne(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.leadsService.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new lead' })
  async create(
    @TenantId() tenantId: string,
    @Body() body: {
      type?: string;
      displayName?: string;
      preferredLanguage?: string;
      countryCode?: string;
      vipLevel?: number;
      score?: number;
      contactPoints?: Array<{ channel: string; handle: string; isPrimary?: boolean; metadata?: Record<string, unknown> }>;
    },
  ) {
    return this.leadsService.create(tenantId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update lead' })
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: {
      type?: string;
      displayName?: string;
      preferredLanguage?: string;
      countryCode?: string;
      vipLevel?: number;
      score?: number;
      status?: string;
    },
  ) {
    return this.leadsService.update(tenantId, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete lead' })
  async remove(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.leadsService.remove(tenantId, id);
  }

  @Post(':id/stage')
  @ApiOperation({ summary: 'Move lead to a stage in a pipeline' })
  async moveStage(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: { pipelineId: string; stageId: string },
  ) {
    return this.leadsService.moveStage(tenantId, id, body.pipelineId, body.stageId);
  }

  @Post(':id/contacts')
  @ApiOperation({ summary: 'Add contact point to lead' })
  async addContact(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: { channel: string; handle: string; isPrimary?: boolean; metadata?: Record<string, unknown> },
  ) {
    return this.leadsService.addContactPoint(tenantId, id, body);
  }

  @Delete(':id/contacts/:contactId')
  @ApiOperation({ summary: 'Remove contact point from lead' })
  async removeContact(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Param('contactId') contactId: string,
  ) {
    return this.leadsService.removeContactPoint(tenantId, id, contactId);
  }
}
