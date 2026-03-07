import { Injectable, Inject, Logger } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_CONNECTION } from '../database/database.module';
import { assistantConversations, assistantActionLogs } from '@koria/database';
import { MetricsAgent } from './agents/metrics.agent';
import { LeadsAgent } from './agents/leads.agent';
import { FollowupAgent } from './agents/followup.agent';
import { ClickupAgent } from './agents/clickup.agent';

interface AgentAction {
  type: string;
  description: string;
  success: boolean;
}

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: PostgresJsDatabase,
    private readonly metricsAgent: MetricsAgent,
    private readonly leadsAgent: LeadsAgent,
    private readonly followupAgent: FollowupAgent,
    private readonly clickupAgent: ClickupAgent,
  ) {}

  async chat(
    tenantId: string,
    userId: string,
    message: string,
    conversationId?: string,
  ) {
    // Load or create conversation
    let conversation: { id: string; messages: Array<{ role: string; content: string; timestamp: string }> };

    if (conversationId) {
      const [existing] = await this.db
        .select()
        .from(assistantConversations)
        .where(
          and(
            eq(assistantConversations.id, conversationId),
            eq(assistantConversations.tenantId, tenantId),
          ),
        );
      if (existing) {
        conversation = {
          id: existing.id,
          messages: (existing.messages as Array<{ role: string; content: string; timestamp: string }>) || [],
        };
      } else {
        conversation = await this.createConversation(tenantId, userId);
      }
    } else {
      conversation = await this.createConversation(tenantId, userId);
    }

    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });

    // Route to appropriate agent
    const { reply, actions } = await this.routeToAgent(tenantId, userId, conversation.id, message);

    // Add assistant reply
    conversation.messages.push({
      role: 'assistant',
      content: reply,
      timestamp: new Date().toISOString(),
    });

    // Persist conversation
    await this.db
      .update(assistantConversations)
      .set({
        messages: conversation.messages,
        updatedAt: new Date(),
      })
      .where(eq(assistantConversations.id, conversation.id));

    return {
      conversationId: conversation.id,
      reply,
      actions,
    };
  }

  async getConversations(tenantId: string, userId: string) {
    return this.db
      .select()
      .from(assistantConversations)
      .where(
        and(
          eq(assistantConversations.tenantId, tenantId),
          eq(assistantConversations.userId, userId),
        ),
      )
      .orderBy(desc(assistantConversations.updatedAt))
      .limit(50);
  }

  async getConversation(tenantId: string, conversationId: string) {
    const [conversation] = await this.db
      .select()
      .from(assistantConversations)
      .where(
        and(
          eq(assistantConversations.id, conversationId),
          eq(assistantConversations.tenantId, tenantId),
        ),
      );
    return conversation || null;
  }

  private async createConversation(tenantId: string, userId: string) {
    const [created] = await this.db
      .insert(assistantConversations)
      .values({ tenantId, userId, messages: [] })
      .returning({ id: assistantConversations.id });
    return { id: created!.id, messages: [] as Array<{ role: string; content: string; timestamp: string }> };
  }

  private async routeToAgent(
    tenantId: string,
    userId: string,
    conversationId: string,
    message: string,
  ): Promise<{ reply: string; actions: AgentAction[] }> {
    const lower = message.toLowerCase();
    const actions: AgentAction[] = [];

    const agentName = this.detectAgent(lower);

    try {
      let reply: string;

      switch (agentName) {
        case 'metrics':
          reply = await this.metricsAgent.execute(tenantId, message);
          break;
        case 'leads':
          reply = await this.leadsAgent.execute(tenantId, message);
          break;
        case 'followup':
          reply = await this.followupAgent.execute(tenantId, message);
          break;
        case 'clickup':
          reply = await this.clickupAgent.execute(tenantId, message);
          break;
        default:
          reply = this.getDefaultReply();
      }

      actions.push({
        type: agentName,
        description: `Processed by ${agentName} agent`,
        success: true,
      });

      await this.logAction(tenantId, userId, conversationId, agentName, message, reply, true);

      return { reply, actions };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Agent ${agentName} failed: ${errorMsg}`);

      await this.logAction(tenantId, userId, conversationId, agentName, message, null, false, errorMsg);

      return {
        reply: '⚠️ Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.',
        actions: [{ type: agentName, description: errorMsg, success: false }],
      };
    }
  }

  private detectAgent(query: string): string {
    // Follow-up keywords
    if (
      query.includes('follow-up') ||
      query.includes('followup') ||
      query.includes('follow up') ||
      (query.includes('agendar') && !query.includes('clickup'))
    ) {
      return 'followup';
    }

    // ClickUp keywords
    if (query.includes('clickup') || query.includes('task') || query.includes('tarefa')) {
      return 'clickup';
    }

    // Lead-specific keywords
    if (
      query.includes('lead parado') ||
      query.includes('leads parados') ||
      query.includes('leads inativos') ||
      query.includes('buscar lead') ||
      query.includes('procurar lead') ||
      query.includes('últimos leads') ||
      query.includes('leads recentes')
    ) {
      return 'leads';
    }

    // Metrics keywords (broader — default analytical agent)
    if (
      query.includes('quantos') ||
      query.includes('receita') ||
      query.includes('faturamento') ||
      query.includes('objeção') ||
      query.includes('objecao') ||
      query.includes('objeções') ||
      query.includes('métrica') ||
      query.includes('metricas') ||
      query.includes('dashboard') ||
      query.includes('resumo') ||
      query.includes('lead')
    ) {
      return 'metrics';
    }

    return 'general';
  }

  private getDefaultReply(): string {
    return [
      '👋 Olá! Sou o assistente KorIA. Posso ajudar com:',
      '',
      '📊 **Métricas** — "Quantos leads entraram essa semana?"',
      '🔍 **Leads** — "Quais leads estão parados?"',
      '📋 **Follow-ups** — "Cria um follow-up pro lead João Silva"',
      '✅ **ClickUp** — "Atualiza a task do Pedro para em produção"',
      '',
      'Como posso ajudar?',
    ].join('\n');
  }

  private async logAction(
    tenantId: string,
    userId: string,
    conversationId: string,
    actionType: string,
    input: string,
    output: string | null,
    success: boolean,
    errorMessage?: string,
  ) {
    try {
      await this.db.insert(assistantActionLogs).values({
        tenantId,
        userId,
        conversationId,
        actionType,
        actionInput: { message: input },
        actionOutput: output ? { reply: output } : null,
        success,
        errorMessage: errorMessage || null,
      });
    } catch (err) {
      this.logger.error('Failed to log assistant action', err);
    }
  }
}
