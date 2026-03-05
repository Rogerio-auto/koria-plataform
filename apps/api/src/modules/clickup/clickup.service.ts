import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FormData = require('form-data');
import fetch from 'node-fetch';

export interface ClickupAttachmentResult {
  id: string;
  url: string;
  title: string;
}

export interface ClickupOAuthTokens {
  access_token: string;
  refresh_token?: string;
  token_type: string;
}

@Injectable()
export class ClickupService {
  private readonly logger = new Logger(ClickupService.name);
  private readonly baseUrl = 'https://api.clickup.com/api/v2';
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private accessToken: string;
  private refreshToken: string;

  constructor(private readonly config: ConfigService) {
    this.clientId = this.config.get<string>('CLICKUP_CLIENT_ID', '');
    this.clientSecret = this.config.get<string>('CLICKUP_CLIENT_SECRET', '');
    this.redirectUri = this.config.get<string>('CLICKUP_REDIRECT_URI', '');
    this.accessToken = this.config.get<string>('CLICKUP_ACCESS_TOKEN', '');
    this.refreshToken = this.config.get<string>('CLICKUP_REFRESH_TOKEN', '');

    if (!this.clientId || !this.clientSecret) {
      this.logger.warn(
        'CLICKUP_CLIENT_ID / CLICKUP_CLIENT_SECRET não configurados — integração ClickUp desabilitada',
      );
    }

    if (!this.accessToken) {
      this.logger.warn(
        'CLICKUP_ACCESS_TOKEN não configurado — use GET /clickup/authorize para obter o token via OAuth 2.0',
      );
    }
  }

  // ──────────────────────────────────────────────
  //  OAuth 2.0 helpers
  // ──────────────────────────────────────────────

  /**
   * Retorna a URL de autorização para redirecionar o usuário ao ClickUp.
   */
  getAuthorizationUrl(): string {
    return `https://app.clickup.com/api?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}`;
  }

  /**
   * Troca o authorization code por access_token + refresh_token.
   * POST https://api.clickup.com/api/v2/oauth/token
   */
  async exchangeCodeForToken(code: string): Promise<ClickupOAuthTokens> {
    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`ClickUp OAuth token exchange falhou (${response.status}): ${body}`);
    }

    const data = (await response.json()) as ClickupOAuthTokens;

    // Armazena em memória (para persistir, salve no banco ou .env)
    this.accessToken = data.access_token;
    if (data.refresh_token) {
      this.refreshToken = data.refresh_token;
    }

    this.logger.log('ClickUp OAuth tokens obtidos com sucesso');
    return data;
  }

  /**
   * Verifica se o serviço tem um access_token válido.
   */
  isConfigured(): boolean {
    return Boolean(this.accessToken);
  }

  /**
   * Retorna os tokens atuais (útil para salvar externamente).
   */
  getCurrentTokens(): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
    };
  }

  // ──────────────────────────────────────────────
  //  API requests (com Bearer token)
  // ──────────────────────────────────────────────

  /**
   * Faz uma request autenticada ao ClickUp.
   * Se receber 401, tenta re-autenticar (log de aviso).
   */
  private async authenticatedFetch(
    url: string,
    options: import('node-fetch').RequestInit,
  ): Promise<import('node-fetch').Response> {
    const headers = {
      ...((options.headers as Record<string, string>) || {}),
      Authorization: `Bearer ${this.accessToken}`,
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      this.logger.error(
        'ClickUp retornou 401 — access_token expirado ou inválido. ' +
        'Use GET /clickup/authorize para re-autorizar.',
      );
    }

    return response;
  }

  /**
   * Attach a file to a ClickUp task.
   * POST /api/v2/task/{task_id}/attachment
   */
  async attachFileToTask(
    taskId: string,
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<ClickupAttachmentResult | null> {
    if (!this.accessToken) {
      this.logger.warn('ClickUp access_token não disponível, pulando attachment');
      return null;
    }

    try {
      const form = new FormData();
      form.append('attachment', fileBuffer, {
        filename: fileName,
        contentType: mimeType,
      });

      const response = await this.authenticatedFetch(
        `${this.baseUrl}/task/${taskId}/attachment`,
        {
          method: 'POST',
          body: form,
        },
      );

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(
          `ClickUp attachment falhou (${response.status}): ${errorBody}`,
        );
        return null;
      }

      const data = (await response.json()) as any;

      this.logger.log(
        `Arquivo "${fileName}" anexado à task ClickUp ${taskId}`,
      );

      return {
        id: data.id || data.attachment?.id || '',
        url: data.url || data.attachment?.url || '',
        title: fileName,
      };
    } catch (error) {
      this.logger.error(
        `Falha ao anexar arquivo à task ClickUp ${taskId}: ${error}`,
      );
      return null;
    }
  }

  /**
   * Post a comment to a ClickUp task.
   * POST /api/v2/task/{task_id}/comment
   */
  async postComment(
    taskId: string,
    commentText: string,
  ): Promise<boolean> {
    if (!this.accessToken) {
      this.logger.warn('ClickUp access_token não disponível, pulando comentário');
      return false;
    }

    try {
      const response = await this.authenticatedFetch(
        `${this.baseUrl}/task/${taskId}/comment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comment_text: commentText }),
        },
      );

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(
          `ClickUp comment falhou (${response.status}): ${errorBody}`,
        );
        return false;
      }

      this.logger.log(`Comentário postado na task ClickUp ${taskId}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Falha ao postar comentário na task ClickUp ${taskId}: ${error}`,
      );
      return false;
    }
  }
}
