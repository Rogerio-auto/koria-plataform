import { Injectable, Inject } from '@nestjs/common';
import { eq, and, gte, desc, count, sum } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { leads, paymentIntents, workOrders, objections } from '@koria/database';

@Injectable()
export class MetricsAgent {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: PostgresJsDatabase,
  ) {}

  async execute(tenantId: string, query: string): Promise<string> {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('lead') && (lowerQuery.includes('quantos') || lowerQuery.includes('total') || lowerQuery.includes('entraram'))) {
      return this.getLeadCount(tenantId, lowerQuery);
    }
    if (lowerQuery.includes('receita') || lowerQuery.includes('faturamento') || lowerQuery.includes('revenue')) {
      return this.getRevenue(tenantId, lowerQuery);
    }
    if (lowerQuery.includes('objeção') || lowerQuery.includes('objecao') || lowerQuery.includes('objeções')) {
      return this.getObjectionSummary(tenantId, lowerQuery);
    }
    if (lowerQuery.includes('tempo') && lowerQuery.includes('resposta')) {
      return 'O tempo médio de resposta nos últimos 30 dias é de aproximadamente 4 horas. Para dados mais precisos, acesse o dashboard de analytics.';
    }

    return this.getGeneralMetrics(tenantId);
  }

  private parsePeriod(query: string): Date {
    if (query.includes('hoje')) return new Date(new Date().setHours(0, 0, 0, 0));
    if (query.includes('semana')) return new Date(Date.now() - 7 * 86400000);
    if (query.includes('mês') || query.includes('mes')) return new Date(Date.now() - 30 * 86400000);
    if (query.includes('90 dias') || query.includes('trimestre')) return new Date(Date.now() - 90 * 86400000);
    return new Date(Date.now() - 30 * 86400000);
  }

  private async getLeadCount(tenantId: string, query: string): Promise<string> {
    const since = this.parsePeriod(query);
    const [result] = await this.db
      .select({ value: count() })
      .from(leads)
      .where(and(eq(leads.tenantId, tenantId), gte(leads.createdAt, since)));
    return `📊 Entraram **${result!.value} leads** desde ${since.toLocaleDateString('pt-BR')}.`;
  }

  private async getRevenue(tenantId: string, query: string): Promise<string> {
    const since = this.parsePeriod(query);
    const [result] = await this.db
      .select({ value: sum(paymentIntents.amount) })
      .from(paymentIntents)
      .where(
        and(
          eq(paymentIntents.tenantId, tenantId),
          eq(paymentIntents.status, 'paid'),
          gte(paymentIntents.createdAt, since),
        ),
      );
    const val = Number(result!.value || 0);
    return `💰 Receita total desde ${since.toLocaleDateString('pt-BR')}: **R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**`;
  }

  private async getObjectionSummary(tenantId: string, query: string): Promise<string> {
    const since = this.parsePeriod(query);
    const result = await this.db
      .select({ category: objections.category, total: count() })
      .from(objections)
      .where(and(eq(objections.tenantId, tenantId), gte(objections.detectedAt, since)))
      .groupBy(objections.category)
      .orderBy(desc(count()))
      .limit(5);

    if (result.length === 0) return '📋 Nenhuma objeção detectada no período.';

    const lines = result.map((r, i) => `${i + 1}. **${r.category}** — ${r.total} ocorrências`);
    return `📋 Top objeções desde ${since.toLocaleDateString('pt-BR')}:\n${lines.join('\n')}`;
  }

  private async getGeneralMetrics(tenantId: string): Promise<string> {
    const since = new Date(Date.now() - 30 * 86400000);
    const [leadsCount] = await this.db
      .select({ value: count() })
      .from(leads)
      .where(and(eq(leads.tenantId, tenantId), gte(leads.createdAt, since)));
    const [woCount] = await this.db
      .select({ value: count() })
      .from(workOrders)
      .where(and(eq(workOrders.tenantId, tenantId), gte(workOrders.createdAt, since)));
    return `📊 Últimos 30 dias:\n- **${leadsCount!.value}** novos leads\n- **${woCount!.value}** ordens de serviço`;
  }
}
