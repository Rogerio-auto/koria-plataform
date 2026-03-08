import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  Redirect,
  Logger,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClickupService } from './clickup.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';

@ApiTags('ClickUp')
@Controller('clickup')
export class ClickupController {
  private readonly logger = new Logger(ClickupController.name);

  constructor(private readonly clickupService: ClickupService) {}

  // ──────────────────────────────────────────────
  //  OAuth (public)
  // ──────────────────────────────────────────────

  @Get('authorize')
  @Redirect()
  @ApiOperation({ summary: 'Iniciar fluxo OAuth 2.0 do ClickUp' })
  authorize() {
    const url = this.clickupService.getAuthorizationUrl();
    this.logger.log(`Redirecionando para autorização ClickUp: ${url}`);
    return { url, statusCode: 302 };
  }

  @Get('callback')
  @ApiOperation({ summary: 'Callback OAuth 2.0 do ClickUp' })
  async callback(@Query('code') code: string) {
    if (!code) {
      throw new BadRequestException('Parâmetro "code" é obrigatório');
    }
    this.logger.log('Recebido callback OAuth do ClickUp, trocando code por token...');
    const tokens = await this.clickupService.exchangeCodeForToken(code);
    return {
      success: true,
      message: 'ClickUp autorizado com sucesso!',
      access_token: tokens.access_token,
      token_type: tokens.token_type,
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Verificar status da conexão ClickUp' })
  status() {
    return {
      configured: this.clickupService.isConfigured(),
      message: this.clickupService.isConfigured()
        ? 'ClickUp conectado via OAuth 2.0'
        : 'ClickUp não conectado — acesse GET /clickup/authorize para autorizar',
    };
  }

  // ──────────────────────────────────────────────
  //  ClickUp discovery (authenticated)
  // ──────────────────────────────────────────────

  @Get('teams')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List ClickUp teams/workspaces' })
  async getTeams() {
    return this.clickupService.getTeams();
  }

  @Get('teams/:teamId/spaces')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List spaces in a ClickUp team' })
  async getSpaces(@Param('teamId') teamId: string) {
    return this.clickupService.getSpaces(teamId);
  }

  @Get('spaces/:spaceId/lists')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List lists in a ClickUp space' })
  async getLists(@Param('spaceId') spaceId: string) {
    return this.clickupService.getLists(spaceId);
  }

  // ──────────────────────────────────────────────
  //  Sync mapping CRUD (authenticated)
  // ──────────────────────────────────────────────

  @Get('sync')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all sync mappings for tenant' })
  async listMappings(@TenantId() tenantId: string) {
    return this.clickupService.getAllSyncMappings(tenantId);
  }

  @Get('sync/:pipelineId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sync mapping for a pipeline' })
  async getMapping(
    @TenantId() tenantId: string,
    @Param('pipelineId') pipelineId: string,
  ) {
    return this.clickupService.getSyncMapping(tenantId, pipelineId);
  }

  @Post('sync')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create sync mapping (pipeline → ClickUp space/list)' })
  async createMapping(
    @TenantId() tenantId: string,
    @Body() body: { pipelineId: string; clickupType: string; clickupEntityId: string; clickupTeamId?: string },
  ) {
    return this.clickupService.createSyncMapping(tenantId, body);
  }

  @Patch('sync/:pipelineId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update sync mapping' })
  async updateMapping(
    @TenantId() tenantId: string,
    @Param('pipelineId') pipelineId: string,
    @Body() body: { clickupType?: string; clickupEntityId?: string; clickupTeamId?: string },
  ) {
    return this.clickupService.updateSyncMapping(tenantId, pipelineId, body);
  }

  @Delete('sync/:pipelineId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove sync mapping' })
  async removeMapping(
    @TenantId() tenantId: string,
    @Param('pipelineId') pipelineId: string,
  ) {
    return this.clickupService.removeSyncMapping(tenantId, pipelineId);
  }

  @Post('sync/:pipelineId/push')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Force push KorIA stages to ClickUp' })
  async forcePush(
    @TenantId() tenantId: string,
    @Param('pipelineId') pipelineId: string,
  ) {
    const success = await this.clickupService.syncStagesToClickup(tenantId, pipelineId);
    return { success };
  }

  @Post('sync/:pipelineId/pull')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Force pull ClickUp statuses to KorIA stages' })
  async forcePull(
    @TenantId() tenantId: string,
    @Param('pipelineId') pipelineId: string,
  ) {
    const success = await this.clickupService.syncClickupToStages(tenantId, pipelineId);
    return { success };
  }

  // ──────────────────────────────────────────────
  //  Webhook (public — ClickUp calls this)
  // ──────────────────────────────────────────────

  @Post('webhook')
  @ApiOperation({ summary: 'Receive ClickUp webhook events' })
  async handleWebhook(@Body() payload: any) {
    this.logger.log(`ClickUp webhook recebido: ${payload?.event}`);

    const event = payload?.event;
    if (!event) return { received: true };

    // Handle space/list status update events
    if (event === 'spaceUpdated' || event === 'listUpdated') {
      const entityId = payload?.space_id || payload?.list_id;
      if (entityId) {
        const mapping = await this.clickupService.findMappingByClickupEntity(String(entityId));
        if (mapping) {
          await this.clickupService.syncClickupToStages(mapping.tenantId, mapping.pipelineId);
          this.logger.log(`ClickUp webhook processado: sync ${entityId} → pipeline ${mapping.pipelineId}`);
        }
      }
    }

    return { received: true };
  }

  @Post('webhook/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a ClickUp webhook for a team' })
  async registerWebhook(
    @Body() body: { teamId: string; callbackUrl: string },
  ) {
    const webhookId = await this.clickupService.registerWebhook(body.teamId, body.callbackUrl);
    return { success: !!webhookId, webhookId };
  }
}
