import { Injectable, Inject } from '@nestjs/common';
import { eq, and, gte, lte, count, sum, sql, desc } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_CONNECTION } from '../database/database.module';
import {
  leads,
  leadQualification,
  leadStage,
  stages,
  pipelines,
  paymentIntents,
  workOrders,
  aiRuns,
  errors,
  followupQueue,
} from '@koria/database';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: PostgresJsDatabase,
  ) {}

  async getOverview(tenantId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 86400000);
    const end = endDate ? new Date(endDate) : new Date();
    const prevStart = new Date(start.getTime() - (end.getTime() - start.getTime()));

    const [currentLeads] = await this.db
      .select({ value: count() })
      .from(leads)
      .where(and(eq(leads.tenantId, tenantId), gte(leads.createdAt, start), lte(leads.createdAt, end)));

    const [prevLeads] = await this.db
      .select({ value: count() })
      .from(leads)
      .where(and(eq(leads.tenantId, tenantId), gte(leads.createdAt, prevStart), lte(leads.createdAt, start)));

    const [qualified] = await this.db
      .select({ value: count() })
      .from(leadQualification)
      .where(
        and(
          eq(leadQualification.tenantId, tenantId),
          eq(leadQualification.status, 'completed'),
          gte(leadQualification.completedAt, start),
          lte(leadQualification.completedAt, end),
        ),
      );

    const [prevQualified] = await this.db
      .select({ value: count() })
      .from(leadQualification)
      .where(
        and(
          eq(leadQualification.tenantId, tenantId),
          eq(leadQualification.status, 'completed'),
          gte(leadQualification.completedAt, prevStart),
          lte(leadQualification.completedAt, start),
        ),
      );

    const [closedDeals] = await this.db
      .select({ value: count() })
      .from(workOrders)
      .where(
        and(
          eq(workOrders.tenantId, tenantId),
          gte(workOrders.createdAt, start),
          lte(workOrders.createdAt, end),
        ),
      );

    const [prevClosedDeals] = await this.db
      .select({ value: count() })
      .from(workOrders)
      .where(
        and(
          eq(workOrders.tenantId, tenantId),
          gte(workOrders.createdAt, prevStart),
          lte(workOrders.createdAt, start),
        ),
      );

    const [revenue] = await this.db
      .select({ value: sum(paymentIntents.amount) })
      .from(paymentIntents)
      .where(
        and(
          eq(paymentIntents.tenantId, tenantId),
          eq(paymentIntents.status, 'paid'),
          gte(paymentIntents.createdAt, start),
          lte(paymentIntents.createdAt, end),
        ),
      );

    const [prevRevenue] = await this.db
      .select({ value: sum(paymentIntents.amount) })
      .from(paymentIntents)
      .where(
        and(
          eq(paymentIntents.tenantId, tenantId),
          eq(paymentIntents.status, 'paid'),
          gte(paymentIntents.createdAt, prevStart),
          lte(paymentIntents.createdAt, start),
        ),
      );

    const calcVariation = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const curLeads = currentLeads!.value;
    const prvLeads = prevLeads!.value;
    const curQual = qualified!.value;
    const prvQual = prevQualified!.value;
    const curDeals = closedDeals!.value;
    const prvDeals = prevClosedDeals!.value;
    const curRev = Number(revenue!.value || 0);
    const prvRev = Number(prevRevenue!.value || 0);

    return {
      totalLeads: { value: curLeads, variation: calcVariation(curLeads, prvLeads) },
      qualifiedLeads: { value: curQual, variation: calcVariation(curQual, prvQual) },
      closedDeals: { value: curDeals, variation: calcVariation(curDeals, prvDeals) },
      revenue: { value: curRev, variation: calcVariation(curRev, prvRev) },
    };
  }

  async getFunnel(tenantId: string) {
    const result = await this.db
      .select({
        stageCode: stages.code,
        stageName: stages.name,
        position: stages.position,
        count: count(),
      })
      .from(leadStage)
      .innerJoin(stages, eq(leadStage.stageId, stages.id))
      .innerJoin(pipelines, eq(leadStage.pipelineId, pipelines.id))
      .where(eq(pipelines.tenantId, tenantId))
      .groupBy(stages.code, stages.name, stages.position)
      .orderBy(stages.position);

    return result;
  }

  async getLeadsByPeriod(tenantId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 86400000);
    const end = endDate ? new Date(endDate) : new Date();

    const result = await this.db
      .select({
        date: sql<string>`DATE(${leads.createdAt})`.as('date'),
        count: count(),
      })
      .from(leads)
      .where(
        and(eq(leads.tenantId, tenantId), gte(leads.createdAt, start), lte(leads.createdAt, end)),
      )
      .groupBy(sql`DATE(${leads.createdAt})`)
      .orderBy(sql`DATE(${leads.createdAt})`);

    return result;
  }

  async getRevenue(tenantId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 86400000);
    const end = endDate ? new Date(endDate) : new Date();

    const result = await this.db
      .select({
        date: sql<string>`DATE(${paymentIntents.createdAt})`.as('date'),
        amount: sum(paymentIntents.amount),
        currency: paymentIntents.currency,
        count: count(),
      })
      .from(paymentIntents)
      .where(
        and(
          eq(paymentIntents.tenantId, tenantId),
          eq(paymentIntents.status, 'paid'),
          gte(paymentIntents.createdAt, start),
          lte(paymentIntents.createdAt, end),
        ),
      )
      .groupBy(sql`DATE(${paymentIntents.createdAt})`, paymentIntents.currency)
      .orderBy(sql`DATE(${paymentIntents.createdAt})`);

    return result;
  }

  async getAiCosts(tenantId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 86400000);
    const end = endDate ? new Date(endDate) : new Date();

    const result = await this.db
      .select({
        date: sql<string>`DATE(${aiRuns.createdAt})`.as('date'),
        agent: aiRuns.agent,
        totalCost: sum(aiRuns.costAmount),
        totalRuns: count(),
        totalTokens: sum(sql`${aiRuns.inputTokens} + ${aiRuns.outputTokens}`),
      })
      .from(aiRuns)
      .where(
        and(
          eq(aiRuns.tenantId, tenantId),
          gte(aiRuns.createdAt, start),
          lte(aiRuns.createdAt, end),
        ),
      )
      .groupBy(sql`DATE(${aiRuns.createdAt})`, aiRuns.agent)
      .orderBy(sql`DATE(${aiRuns.createdAt})`);

    return result;
  }

  async getErrors(tenantId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 86400000);
    const end = endDate ? new Date(endDate) : new Date();

    const result = await this.db
      .select({
        context: errors.context,
        count: count(),
      })
      .from(errors)
      .where(
        and(
          eq(errors.tenantId, tenantId),
          gte(errors.createdAt, start),
          lte(errors.createdAt, end),
        ),
      )
      .groupBy(errors.context)
      .orderBy(desc(count()));

    return result;
  }

  async getFollowupConversionRate(tenantId: string) {
    const [total] = await this.db
      .select({ value: count() })
      .from(followupQueue)
      .where(
        and(eq(followupQueue.tenantId, tenantId), eq(followupQueue.status, 'sent')),
      );

    // For now, return a placeholder. Real implementation would track conversion through stage changes.
    return {
      totalSent: total!.value,
      conversions: 0,
      rate: 0,
    };
  }
}
