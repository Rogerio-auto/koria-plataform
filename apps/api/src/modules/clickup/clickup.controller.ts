import {
  Controller,
  Get,
  Query,
  Redirect,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ClickupService } from './clickup.service';

@ApiTags('ClickUp')
@Controller('clickup')
export class ClickupController {
  private readonly logger = new Logger(ClickupController.name);

  constructor(private readonly clickupService: ClickupService) {}

  /**
   * Redireciona para a tela de autorização do ClickUp.
   * GET /api/v1/clickup/authorize
   */
  @Get('authorize')
  @Redirect()
  @ApiOperation({ summary: 'Iniciar fluxo OAuth 2.0 do ClickUp' })
  authorize() {
    const url = this.clickupService.getAuthorizationUrl();
    this.logger.log(`Redirecionando para autorização ClickUp: ${url}`);
    return { url, statusCode: 302 };
  }

  /**
   * Callback do ClickUp após autorização.
   * GET /api/v1/clickup/callback?code=xxx
   * Troca o code por access_token.
   */
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
      message: 'ClickUp autorizado com sucesso! Salve o access_token no .env para persistir.',
      access_token: tokens.access_token,
      token_type: tokens.token_type,
    };
  }

  /**
   * Verifica status da conexão com ClickUp.
   * GET /api/v1/clickup/status
   */
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
}
