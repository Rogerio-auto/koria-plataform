import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PipelinesService } from './pipelines.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';

@ApiTags('Pipelines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pipelines')
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  @Get()
  @ApiOperation({ summary: 'List all pipelines with stages' })
  async findAll(@TenantId() tenantId: string) {
    return this.pipelinesService.findAllPipelines(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pipeline with stages' })
  async findOne(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.pipelinesService.findOnePipeline(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create pipeline' })
  async create(
    @TenantId() tenantId: string,
    @Body() body: { name: string },
  ) {
    return this.pipelinesService.createPipeline(tenantId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update pipeline' })
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: { name?: string },
  ) {
    return this.pipelinesService.updatePipeline(tenantId, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete pipeline and its stages' })
  async remove(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.pipelinesService.removePipeline(tenantId, id);
  }

  // --- Stage endpoints ---

  @Post(':id/stages')
  @ApiOperation({ summary: 'Create a stage in a pipeline' })
  async createStage(
    @TenantId() tenantId: string,
    @Param('id') pipelineId: string,
    @Body() body: { name: string; code: string; position?: number; isTerminal?: boolean },
  ) {
    return this.pipelinesService.createStage(tenantId, {
      pipelineId,
      ...body,
    });
  }

  @Patch('stages/:stageId')
  @ApiOperation({ summary: 'Update a stage' })
  async updateStage(
    @TenantId() tenantId: string,
    @Param('stageId') stageId: string,
    @Body() body: { name?: string; code?: string; position?: number; isTerminal?: boolean },
  ) {
    return this.pipelinesService.updateStage(tenantId, stageId, body);
  }

  @Delete('stages/:stageId')
  @ApiOperation({ summary: 'Delete a stage' })
  async removeStage(
    @TenantId() tenantId: string,
    @Param('stageId') stageId: string,
  ) {
    return this.pipelinesService.removeStage(tenantId, stageId);
  }

  @Post(':id/stages/reorder')
  @ApiOperation({ summary: 'Reorder stages in a pipeline' })
  async reorderStages(
    @TenantId() tenantId: string,
    @Param('id') pipelineId: string,
    @Body() body: { stages: Array<{ id: string; position: number }> },
  ) {
    return this.pipelinesService.reorderStages(tenantId, pipelineId, body.stages);
  }
}
