import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BriefingFormConfigService } from './briefing-form-config.service';
import { CreateBriefingFormConfigDto } from './dto/create-briefing-form-config.dto';
import { UpdateBriefingFormConfigDto } from './dto/update-briefing-form-config.dto';

@ApiTags('Settings — Briefing Form')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings/briefing-form')
export class BriefingFormConfigController {
  constructor(private readonly service: BriefingFormConfigService) {}

  @Get()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'List all briefing form configs for the tenant' })
  async list(@Req() req: any) {
    return this.service.listByTenant(req.user.tenantId);
  }

  @Get('templates')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'List built-in templates' })
  getTemplates() {
    return this.service.getTemplates();
  }

  @Get(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get a specific briefing form config' })
  async findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create a new briefing form config (draft)' })
  async create(@Req() req: any, @Body() dto: CreateBriefingFormConfigDto) {
    return this.service.create(req.user.tenantId, dto);
  }

  @Put(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update a draft briefing form config' })
  async update(@Param('id') id: string, @Body() dto: UpdateBriefingFormConfigDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/publish')
  @Roles('admin')
  @ApiOperation({ summary: 'Publish a config (activates it, deactivates others)' })
  async publish(@Param('id') id: string) {
    return this.service.publish(id);
  }

  @Post(':id/duplicate')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Duplicate a config as a new draft' })
  async duplicate(@Param('id') id: string) {
    return this.service.duplicate(id);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a draft config' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
