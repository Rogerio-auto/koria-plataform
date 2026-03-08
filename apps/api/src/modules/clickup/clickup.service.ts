import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq, and } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import FormData = require('form-data');
import fetch from 'node-fetch';
import { DATABASE_CONNECTION } from '../database/database.module';
import { clickupSync, stages } from '@koria/database';

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

  constructor(
    private readonly config: ConfigService,
    @Inject(DATABASE_CONNECTION)
    private readonly db: PostgresJsDatabase,
  ) {
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

  // ──────────────────────────────────────────────
  //  Pipeline ↔ ClickUp status sync
  // ──────────────────────────────────────────────

  /** Get teams (workspaces) the authenticated user belongs to */
  async getTeams(): Promise<Array<{ id: string; name: string }>> {
    if (!this.accessToken) return [];
    try {
      const res = await this.authenticatedFetch(`${this.baseUrl}/team`, { method: 'GET' });
      if (!res.ok) return [];
      const data = (await res.json()) as any;
      return (data.teams || []).map((t: any) => ({ id: t.id, name: t.name }));
    } catch {
      return [];
    }
  }

  /** Get spaces for a team */
  async getSpaces(teamId: string): Promise<Array<{ id: string; name: string; statuses: ClickupStatus[] }>> {
    if (!this.accessToken) return [];
    try {
      const res = await this.authenticatedFetch(`${this.baseUrl}/team/${teamId}/space?archived=false`, { method: 'GET' });
      if (!res.ok) return [];
      const data = (await res.json()) as any;
      return (data.spaces || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        statuses: (s.statuses || []).map((st: any) => ({
          status: st.status,
          type: st.type,
          orderindex: st.orderindex,
          color: st.color,
        })),
      }));
    } catch {
      return [];
    }
  }

  /** Get a single space with statuses */
  async getSpace(spaceId: string): Promise<{ id: string; name: string; statuses: ClickupStatus[] } | null> {
    if (!this.accessToken) return null;
    try {
      const res = await this.authenticatedFetch(`${this.baseUrl}/space/${spaceId}`, { method: 'GET' });
      if (!res.ok) return null;
      const s = (await res.json()) as any;
      return {
        id: s.id,
        name: s.name,
        statuses: (s.statuses || []).map((st: any) => ({
          status: st.status,
          type: st.type,
          orderindex: st.orderindex,
          color: st.color,
        })),
      };
    } catch {
      return null;
    }
  }

  /** Get lists in a space (lists also have their own statuses) */
  async getLists(spaceId: string): Promise<Array<{ id: string; name: string; statuses: ClickupStatus[] }>> {
    if (!this.accessToken) return [];
    try {
      // Lists are nested inside folders; also get folderless lists
      const folderlessRes = await this.authenticatedFetch(`${this.baseUrl}/space/${spaceId}/list?archived=false`, { method: 'GET' });
      const lists: Array<{ id: string; name: string; statuses: ClickupStatus[] }> = [];

      if (folderlessRes.ok) {
        const data = (await folderlessRes.json()) as any;
        for (const l of data.lists || []) {
          lists.push({
            id: l.id,
            name: l.name,
            statuses: (l.statuses || []).map((st: any) => ({
              status: st.status,
              type: st.type,
              orderindex: st.orderindex,
              color: st.color,
            })),
          });
        }
      }

      // Also get folders and their lists
      const foldersRes = await this.authenticatedFetch(`${this.baseUrl}/space/${spaceId}/folder?archived=false`, { method: 'GET' });
      if (foldersRes.ok) {
        const fdata = (await foldersRes.json()) as any;
        for (const folder of fdata.folders || []) {
          for (const l of folder.lists || []) {
            lists.push({
              id: l.id,
              name: `${folder.name} / ${l.name}`,
              statuses: (l.statuses || []).map((st: any) => ({
                status: st.status,
                type: st.type,
                orderindex: st.orderindex,
                color: st.color,
              })),
            });
          }
        }
      }

      return lists;
    } catch {
      return [];
    }
  }

  /**
   * Push KorIA pipeline stages as statuses to the mapped ClickUp space.
   * ClickUp requires the COMPLETE list of statuses in a single PUT.
   */
  async syncStagesToClickup(tenantId: string, pipelineId: string): Promise<boolean> {
    if (!this.accessToken) {
      this.logger.warn('ClickUp não configurado, pulando sync de stages');
      return false;
    }

    // Find the sync mapping for this pipeline
    const [mapping] = await this.db
      .select()
      .from(clickupSync)
      .where(and(eq(clickupSync.pipelineId, pipelineId), eq(clickupSync.tenantId, tenantId)))
      .limit(1);

    if (!mapping) {
      this.logger.debug(`Pipeline ${pipelineId} não tem mapeamento ClickUp, pulando sync`);
      return false;
    }

    // Get current KorIA stages for this pipeline
    const pipelineStages = await this.db
      .select()
      .from(stages)
      .where(eq(stages.pipelineId, pipelineId))
      .orderBy(stages.position);

    // Build ClickUp statuses array
    const clickupStatuses: Array<{ status: string; type: string; orderindex: number; color: string }> = [];
    for (const stage of pipelineStages) {
      const statusName = (mapping.statusMapping as Record<string, string>)?.[stage.id] || stage.name;
      clickupStatuses.push({
        status: statusName,
        type: stage.isTerminal ? 'closed' : 'custom',
        orderindex: stage.position,
        color: stage.isTerminal ? '#6bc950' : '#87909e',
      });
    }

    try {
      const entityType = mapping.clickupType; // 'space' or 'list'
      const entityId = mapping.clickupEntityId;
      const url = `${this.baseUrl}/${entityType}/${entityId}`;

      const res = await this.authenticatedFetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statuses: clickupStatuses }),
      });

      if (!res.ok) {
        const body = await res.text();
        this.logger.error(`ClickUp sync falhou (${res.status}): ${body}`);
        return false;
      }

      // Update last sync timestamp
      await this.db
        .update(clickupSync)
        .set({ lastSyncAt: new Date(), updatedAt: new Date() })
        .where(eq(clickupSync.id, mapping.id));

      this.logger.log(`Pipeline ${pipelineId} sincronizado com ClickUp ${entityType}/${entityId}`);
      return true;
    } catch (error) {
      this.logger.error(`Falha ao sincronizar pipeline ${pipelineId} com ClickUp: ${error}`);
      return false;
    }
  }

  /**
   * Pull statuses from ClickUp and create/update stages in KorIA pipeline.
   * Used when receiving a webhook from ClickUp about status changes.
   */
  async syncClickupToStages(tenantId: string, pipelineId: string): Promise<boolean> {
    if (!this.accessToken) return false;

    const [mapping] = await this.db
      .select()
      .from(clickupSync)
      .where(and(eq(clickupSync.pipelineId, pipelineId), eq(clickupSync.tenantId, tenantId)))
      .limit(1);

    if (!mapping) return false;

    try {
      const entityType = mapping.clickupType;
      const entityId = mapping.clickupEntityId;
      const url = `${this.baseUrl}/${entityType}/${entityId}`;

      const res = await this.authenticatedFetch(url, { method: 'GET' });
      if (!res.ok) return false;

      const data = (await res.json()) as any;
      const clickupStatuses: ClickupStatus[] = (data.statuses || []).map((st: any) => ({
        status: st.status,
        type: st.type,
        orderindex: st.orderindex,
        color: st.color,
      }));

      // Get current stages
      const currentStages = await this.db
        .select()
        .from(stages)
        .where(eq(stages.pipelineId, pipelineId))
        .orderBy(stages.position);

      const currentNames = new Set(currentStages.map((s) => s.name.toLowerCase()));
      const clickupNames = new Set(clickupStatuses.map((s) => s.status.toLowerCase()));

      // Add new statuses from ClickUp that don't exist in KorIA
      for (const cs of clickupStatuses) {
        if (!currentNames.has(cs.status.toLowerCase())) {
          const code = cs.status.toLowerCase().replace(/\s+/g, '_');
          await this.db.insert(stages).values({
            pipelineId,
            name: cs.status,
            code,
            position: cs.orderindex,
            isTerminal: cs.type === 'closed' || cs.type === 'done',
          });
          this.logger.log(`Stage "${cs.status}" criado no pipeline ${pipelineId} (via ClickUp)`);
        }
      }

      // Remove stages that no longer exist in ClickUp
      for (const stage of currentStages) {
        if (!clickupNames.has(stage.name.toLowerCase())) {
          await this.db.delete(stages).where(eq(stages.id, stage.id));
          this.logger.log(`Stage "${stage.name}" removido do pipeline ${pipelineId} (não existe mais no ClickUp)`);
        }
      }

      // Update positions for existing stages
      for (const cs of clickupStatuses) {
        const existing = currentStages.find((s) => s.name.toLowerCase() === cs.status.toLowerCase());
        if (existing && (existing.position !== cs.orderindex || existing.isTerminal !== (cs.type === 'closed' || cs.type === 'done'))) {
          await this.db
            .update(stages)
            .set({
              position: cs.orderindex,
              isTerminal: cs.type === 'closed' || cs.type === 'done',
            })
            .where(eq(stages.id, existing.id));
        }
      }

      await this.db
        .update(clickupSync)
        .set({ lastSyncAt: new Date(), updatedAt: new Date() })
        .where(eq(clickupSync.id, mapping.id));

      this.logger.log(`Pipeline ${pipelineId} atualizado com statuses do ClickUp`);
      return true;
    } catch (error) {
      this.logger.error(`Falha ao puxar statuses do ClickUp para pipeline ${pipelineId}: ${error}`);
      return false;
    }
  }

  // ──────────────────────────────────────────────
  //  Sync mapping CRUD
  // ──────────────────────────────────────────────

  async getSyncMapping(tenantId: string, pipelineId: string) {
    const [mapping] = await this.db
      .select()
      .from(clickupSync)
      .where(and(eq(clickupSync.pipelineId, pipelineId), eq(clickupSync.tenantId, tenantId)))
      .limit(1);
    return mapping || null;
  }

  async getAllSyncMappings(tenantId: string) {
    return this.db
      .select()
      .from(clickupSync)
      .where(eq(clickupSync.tenantId, tenantId));
  }

  async createSyncMapping(
    tenantId: string,
    data: { pipelineId: string; clickupType: string; clickupEntityId: string; clickupTeamId?: string },
  ) {
    const [mapping] = await this.db
      .insert(clickupSync)
      .values({
        tenantId,
        pipelineId: data.pipelineId,
        clickupType: data.clickupType,
        clickupEntityId: data.clickupEntityId,
        clickupTeamId: data.clickupTeamId || null,
      })
      .returning();

    // Do initial sync: push KorIA stages to ClickUp
    await this.syncStagesToClickup(tenantId, data.pipelineId);

    return mapping;
  }

  async updateSyncMapping(
    tenantId: string,
    pipelineId: string,
    data: { clickupType?: string; clickupEntityId?: string; clickupTeamId?: string },
  ) {
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (data.clickupType !== undefined) updates.clickupType = data.clickupType;
    if (data.clickupEntityId !== undefined) updates.clickupEntityId = data.clickupEntityId;
    if (data.clickupTeamId !== undefined) updates.clickupTeamId = data.clickupTeamId;

    await this.db
      .update(clickupSync)
      .set(updates)
      .where(and(eq(clickupSync.pipelineId, pipelineId), eq(clickupSync.tenantId, tenantId)));

    return this.getSyncMapping(tenantId, pipelineId);
  }

  async removeSyncMapping(tenantId: string, pipelineId: string) {
    await this.db
      .delete(clickupSync)
      .where(and(eq(clickupSync.pipelineId, pipelineId), eq(clickupSync.tenantId, tenantId)));
    return { success: true };
  }

  // ──────────────────────────────────────────────
  //  Webhook management
  // ──────────────────────────────────────────────

  /** Register a webhook in ClickUp to receive status change events */
  async registerWebhook(teamId: string, callbackUrl: string): Promise<string | null> {
    if (!this.accessToken) return null;
    try {
      const res = await this.authenticatedFetch(`${this.baseUrl}/team/${teamId}/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: callbackUrl,
          events: ['taskStatusUpdated', 'listUpdated', 'spaceUpdated'],
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        this.logger.error(`ClickUp webhook registration failed (${res.status}): ${body}`);
        return null;
      }
      const data = (await res.json()) as any;
      this.logger.log(`ClickUp webhook registrado: ${data.id}`);
      return data.id;
    } catch (error) {
      this.logger.error(`Falha ao registrar webhook ClickUp: ${error}`);
      return null;
    }
  }

  /** Find pipeline mapping by ClickUp entity id (for webhook processing) */
  async findMappingByClickupEntity(clickupEntityId: string) {
    const [mapping] = await this.db
      .select()
      .from(clickupSync)
      .where(eq(clickupSync.clickupEntityId, clickupEntityId))
      .limit(1);
    return mapping || null;
  }
}

export interface ClickupStatus {
  status: string;
  type: string;
  orderindex: number;
  color: string;
}
