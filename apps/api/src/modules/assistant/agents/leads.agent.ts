import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc, like, lte } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { leads } from '@koria/database';

@Injectable()
export class LeadsAgent {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: PostgresJsDatabase,
  ) {}

  async execute(tenantId: string, query: string): Promise<string> {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('parado') || lowerQuery.includes('inativo') || lowerQuery.includes('stale')) {
      return this.getStaleLeads(tenantId);
    }
    if (lowerQuery.includes('buscar') || lowerQuery.includes('encontrar') || lowerQuery.includes('mostra')) {
      return this.searchLeads(tenantId, query);
    }
    return this.getRecentLeads(tenantId);
  }

  private async getStaleLeads(tenantId: string): Promise<string> {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000);
    const result = await this.db
      .select({
        id: leads.id,
        displayName: leads.displayName,
        updatedAt: leads.updatedAt,
      })
      .from(leads)
      .where(
        and(
          eq(leads.tenantId, tenantId),
          eq(leads.status, 'active'),
          lte(leads.updatedAt, threeDaysAgo),
        ),
      )
      .orderBy(leads.updatedAt)
      .limit(10);

    if (result.length === 0) return '✅ Nenhum lead parado há mais de 3 dias!';

    const lines = result.map((l) => {
      const days = Math.floor((Date.now() - new Date(l.updatedAt).getTime()) / 86400000);
      return `- **${l.displayName || 'Sem nome'}** — parado há ${days} dias`;
    });
    return `⚠️ Leads parados há mais de 3 dias:\n${lines.join('\n')}`;
  }

  private async searchLeads(tenantId: string, query: string): Promise<string> {
    const nameMatch = query.match(/(?:lead|buscar|encontrar|mostra)\s+(.+)/i);
    const searchTerm = nameMatch?.[1]?.trim() || '';

    if (!searchTerm) return 'Por favor, forneça um nome para buscar.';

    const result = await this.db
      .select({
        id: leads.id,
        displayName: leads.displayName,
        status: leads.status,
        createdAt: leads.createdAt,
      })
      .from(leads)
      .where(
        and(
          eq(leads.tenantId, tenantId),
          like(leads.displayName, `%${searchTerm}%`),
        ),
      )
      .limit(5);

    if (result.length === 0) return `🔍 Nenhum lead encontrado com "${searchTerm}".`;

    const lines = result.map((l) => `- **${l.displayName}** (${l.status}) — criado em ${new Date(l.createdAt).toLocaleDateString('pt-BR')}`);
    return `🔍 Leads encontrados:\n${lines.join('\n')}`;
  }

  private async getRecentLeads(tenantId: string): Promise<string> {
    const result = await this.db
      .select({
        displayName: leads.displayName,
        status: leads.status,
        createdAt: leads.createdAt,
      })
      .from(leads)
      .where(eq(leads.tenantId, tenantId))
      .orderBy(desc(leads.createdAt))
      .limit(5);

    if (result.length === 0) return 'Nenhum lead encontrado.';

    const lines = result.map((l) => `- **${l.displayName || 'Sem nome'}** (${l.status}) — ${new Date(l.createdAt).toLocaleDateString('pt-BR')}`);
    return `📋 Últimos leads:\n${lines.join('\n')}`;
  }
}
