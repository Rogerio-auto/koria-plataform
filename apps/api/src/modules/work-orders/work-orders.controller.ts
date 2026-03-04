import { Controller, Get, Patch, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkOrdersService } from './work-orders.service';

@ApiTags('Work Orders')
@ApiBearerAuth()
@Controller('work-orders')
export class WorkOrdersController {
  constructor(readonly workOrdersService: WorkOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List work orders (paginated)' })
  async findAll(@Query() _query: unknown) {
    // TODO: Use vw_work_orders view
    return { message: 'List work orders — not yet implemented' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get work order details' })
  async findOne(@Param('id') _id: string) {
    // TODO: Return work order with assets
    return { message: 'Get work order — not yet implemented' };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update work order' })
  async update(@Param('id') _id: string) {
    // TODO: Update status, due_at, external_task_id
    return { message: 'Update work order — not yet implemented' };
  }

  @Get(':id/assets')
  @ApiOperation({ summary: 'List work order assets' })
  async listAssets(@Param('id') _id: string) {
    // TODO: Return work_order_assets
    return { message: 'List assets — not yet implemented' };
  }
}
