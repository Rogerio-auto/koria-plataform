import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AssistantService } from './assistant.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';

@ApiTags('Assistant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager', 'sdr')
@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Send a message to the AI assistant' })
  async chat(
    @TenantId() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() body: { conversationId?: string; message: string },
  ) {
    return this.assistantService.chat(tenantId, user.id, body.message, body.conversationId);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'List user conversations' })
  async getConversations(
    @TenantId() tenantId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.assistantService.getConversations(tenantId, user.id);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get a specific conversation' })
  async getConversation(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.assistantService.getConversation(tenantId, id);
  }
}
