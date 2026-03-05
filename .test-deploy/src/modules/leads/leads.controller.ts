import { Controller, Get, Patch, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LeadsService } from './leads.service';

@ApiTags('Leads')
@ApiBearerAuth()
@Controller('leads')
export class LeadsController {
  constructor(readonly leadsService: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'List leads (paginated, filterable)' })
  async findAll(@Query() _query: unknown) {
    // TODO: Implement with pagination, filters, and tenant guard
    return { message: 'List leads — not yet implemented' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lead by ID' })
  async findOne(@Param('id') _id: string) {
    // TODO: Implement
    return { message: 'Get lead — not yet implemented' };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update lead' })
  async update(@Param('id') _id: string) {
    // TODO: Implement
    return { message: 'Update lead — not yet implemented' };
  }

  @Get(':id/qualification')
  @ApiOperation({ summary: 'Get lead qualification data' })
  async getQualification(@Param('id') _id: string) {
    // TODO: Implement
    return { message: 'Get qualification — not yet implemented' };
  }
}
