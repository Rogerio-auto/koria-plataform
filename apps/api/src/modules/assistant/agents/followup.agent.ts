import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { followupQueue, followupRules, leads } from '@koria/database';

@Injectable()
export class FollowupAgent {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: PostgresJsDatabase,
  ) {}

  async execute(tenantId: string, query: string): Promise<string> {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('criar') || lowerQuery.includes('cria') || lowerQuery.includes('agendar')) {
      return this.createFollowup(tenantId, query);
    }

    return this.listPendingFollowups(tenantId);
  }

  private async createFollowup(tenantId: string, query: string): Promise<string> {
    const nameMatch = query.match(/(?:para|pro|pra|follow-?up)\s+(?:o\s+)?(?:lead\s+)?([A-Z][a-záéíóúãõâêô]+(?:\s+[A-Z][a-záéíóúãõâêô]+)*)/i);
    const leadName = nameMatch?.[1]?.trim();

    if (!leadName) return '❓ Para qual lead devo criar o follow-up? Exemplo: "Cria um follow-up pro lead João Silva"';

    const leadResult = await this.db
      .select({ id: leads.id, displayName: leads.displayName })
      .from(leads)
      .where(and(eq(leads.tenantId, tenantId), eq(leads.status, 'active')))
      .limit(100);

    const matchedLead = leadResult.find(
      (l) => l.displayName?.toLowerCase().includes(leadName.toLowerCase()),
    );

    if (!matchedLead) return `❌ Lead "${leadName}" não encontrado. Verifique o nome e tente novamente.`;

    const [rule] = await this.db
      .select()
      .from(followupRules)
      .where(and(eq(followupRules.tenantId, tenantId), eq(followupRules.active, true)))
      .limit(1);

    if (!rule) return '⚠️ Não há regras de follow-up ativas. Configure uma regra no sistema primeiro.';

    const scheduledAt = new Date(Date.now() + rule.delayMinutes * 60 * 1000);

    await this.db.insert(followupQueue).values({
      tenantId,
      leadId: matchedLead.id,
      ruleId: rule.id,
      scheduledAt,
      status: 'scheduled',
    });

    return `✅ Follow-up agendado para **${matchedLead.displayName}** em ${scheduledAt.toLocaleString('pt-BR')} (${rule.channel}).`;
  }

  private async listPendingFollowups(tenantId: string): Promise<string> {
    const result = await this.db
      .select({
        leadId: followupQueue.leadId,
        scheduledAt: followupQueue.scheduledAt,
        status: followupQueue.status,
      })
      .from(followupQueue)
      .where(
        and(eq(followupQueue.tenantId, tenantId), eq(followupQueue.status, 'scheduled')),
      )
      .limit(10);

    if (result.length === 0) return '📋 Nenhum follow-up pendente.';

    return `📋 **${result.length}** follow-ups agendados pendentes.`;
  }
}
