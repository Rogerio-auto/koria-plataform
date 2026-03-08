import { Injectable, Inject } from '@nestjs/common';
import { eq, and, gte, lte, count, sum, sql, desc, lt } from 'drizzle-orm';
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
  contactPoints,
  quotes,
  events,
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

  // --- Fase 2: New derived metrics ---

  async getConversionRates(tenantId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 86400000);
    const end = endDate ? new Date(endDate) : new Date();
    const dateFilter = and(gte(leads.createdAt, start), lte(leads.createdAt, end));

    const [totalLeads] = await this.db
      .select({ value: count() })
      .from(leads)
      .where(and(eq(leads.tenantId, tenantId), dateFilter));

    const [qualifiedLeads] = await this.db
      .select({ value: count() })
      .from(leadQualification)
      .where(
        and(
          eq(leadQualification.tenantId, tenantId),
          eq(leadQualification.status, 'completed'),
        ),
      );

    const [totalDeals] = await this.db
      .select({ value: count() })
      .from(workOrders)
      .where(and(eq(workOrders.tenantId, tenantId), gte(workOrders.createdAt, start), lte(workOrders.createdAt, end)));

    const [paidDeals] = await this.db
      .select({ value: count() })
      .from(paymentIntents)
      .where(
        and(
          eq(paymentIntents.tenantId, tenantId),
          eq(paymentIntents.status, 'paid'),
          gte(paymentIntents.createdAt, start),
          lte(paymentIntents.createdAt, end),
        ),
      );

    const tl = totalLeads!.value;
    const ql = qualifiedLeads!.value;
    const td = totalDeals!.value;
    const pd = paidDeals!.value;
    const rate = (a: number, b: number) => (b === 0 ? 0 : Math.round((a / b) * 1000) / 10);

    return {
      leadToQualified: { total: tl, converted: ql, rate: rate(ql, tl) },
      qualifiedToDeal: { total: ql, converted: td, rate: rate(td, ql) },
      dealToPaid: { total: td, converted: pd, rate: rate(pd, td) },
      overallConversion: rate(pd, tl),
    };
  }

  async getAverageTicket(tenantId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 86400000);
    const end = endDate ? new Date(endDate) : new Date();
    const prevStart = new Date(start.getTime() - (end.getTime() - start.getTime()));

    const [current] = await this.db
      .select({ total: sum(paymentIntents.amount), deals: count() })
      .from(paymentIntents)
      .where(
        and(
          eq(paymentIntents.tenantId, tenantId),
          eq(paymentIntents.status, 'paid'),
          gte(paymentIntents.createdAt, start),
          lte(paymentIntents.createdAt, end),
        ),
      );

    const [prev] = await this.db
      .select({ total: sum(paymentIntents.amount), deals: count() })
      .from(paymentIntents)
      .where(
        and(
          eq(paymentIntents.tenantId, tenantId),
          eq(paymentIntents.status, 'paid'),
          gte(paymentIntents.createdAt, prevStart),
          lte(paymentIntents.createdAt, start),
        ),
      );

    const curTotal = Number(current!.total || 0);
    const curDeals = current!.deals;
    const prevTotal = Number(prev!.total || 0);
    const prevDeals = prev!.deals;
    const curAvg = curDeals > 0 ? curTotal / curDeals : 0;
    const prevAvg = prevDeals > 0 ? prevTotal / prevDeals : 0;
    const variation = prevAvg === 0 ? (curAvg > 0 ? 100 : 0) : Math.round(((curAvg - prevAvg) / prevAvg) * 100);

    return {
      averageTicket: Math.round(curAvg * 100) / 100,
      totalRevenue: curTotal,
      totalDeals: curDeals,
      variation,
    };
  }

  async getFunnelByPipeline(tenantId: string, pipelineId?: string) {
    const baseConditions = pipelineId
      ? and(eq(pipelines.tenantId, tenantId), eq(pipelines.id, pipelineId))
      : eq(pipelines.tenantId, tenantId);

    const pipelineRows = await this.db
      .select({ id: pipelines.id, name: pipelines.name })
      .from(pipelines)
      .where(baseConditions)
      .orderBy(pipelines.name);

    const result = [];
    for (const p of pipelineRows) {
      const stageRows = await this.db
        .select({
          id: stages.id,
          name: stages.name,
          code: stages.code,
          position: stages.position,
          count: count(),
        })
        .from(leadStage)
        .innerJoin(stages, eq(leadStage.stageId, stages.id))
        .where(eq(leadStage.pipelineId, p.id))
        .groupBy(stages.id, stages.name, stages.code, stages.position)
        .orderBy(stages.position);

      const totalLeads = stageRows.reduce((acc, s) => acc + s.count, 0);
      result.push({
        id: p.id,
        name: p.name,
        totalLeads,
        stages: stageRows.map((s) => ({
          ...s,
          percentage: totalLeads > 0 ? Math.round((s.count / totalLeads) * 1000) / 10 : 0,
        })),
      });
    }

    return { pipelines: result };
  }

  async getLeadSources(tenantId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 86400000);
    const end = endDate ? new Date(endDate) : new Date();

    const result = await this.db
      .select({
        source: leadQualification.howFoundUs,
        count: count(),
      })
      .from(leadQualification)
      .where(
        and(
          eq(leadQualification.tenantId, tenantId),
          gte(leadQualification.createdAt, start),
          lte(leadQualification.createdAt, end),
        ),
      )
      .groupBy(leadQualification.howFoundUs)
      .orderBy(desc(count()));

    const total = result.reduce((acc, r) => acc + r.count, 0);
    return result
      .filter((r) => r.source)
      .map((r) => ({
        source: r.source,
        count: r.count,
        percentage: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
      }));
  }

  async getChannelsDistribution(tenantId: string) {
    const result = await this.db
      .select({
        channel: contactPoints.channel,
        count: count(),
      })
      .from(contactPoints)
      .where(eq(contactPoints.tenantId, tenantId))
      .groupBy(contactPoints.channel)
      .orderBy(desc(count()));

    const total = result.reduce((acc, r) => acc + r.count, 0);
    return result.map((r) => ({
      channel: r.channel,
      count: r.count,
      percentage: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
    }));
  }

  async getQuoteFunnel(tenantId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 86400000);
    const end = endDate ? new Date(endDate) : new Date();

    const result = await this.db
      .select({
        status: quotes.status,
        count: count(),
        totalValue: sum(quotes.total),
      })
      .from(quotes)
      .where(
        and(
          eq(quotes.tenantId, tenantId),
          gte(quotes.createdAt, start),
          lte(quotes.createdAt, end),
        ),
      )
      .groupBy(quotes.status);

    const statusMap: Record<string, { count: number; value: number }> = {};
    for (const r of result) {
      statusMap[r.status] = { count: r.count, value: Number(r.totalValue || 0) };
    }

    const totalQuotes = result.reduce((acc, r) => acc + r.count, 0);
    const accepted = statusMap['accepted']?.count ?? 0;
    const totalValue = result.reduce((acc, r) => acc + Number(r.totalValue || 0), 0);

    return {
      draft: statusMap['draft']?.count ?? 0,
      sent: statusMap['sent']?.count ?? 0,
      accepted,
      rejected: statusMap['rejected']?.count ?? 0,
      expired: statusMap['expired']?.count ?? 0,
      acceptanceRate: totalQuotes > 0 ? Math.round((accepted / totalQuotes) * 100) : 0,
      totalValue,
    };
  }

  async getWorkOrderStatus(tenantId: string) {
    const statusResult = await this.db
      .select({
        status: workOrders.status,
        count: count(),
      })
      .from(workOrders)
      .where(eq(workOrders.tenantId, tenantId))
      .groupBy(workOrders.status)
      .orderBy(workOrders.status);

    const now = new Date();
    const [overdue] = await this.db
      .select({ value: count() })
      .from(workOrders)
      .where(
        and(
          eq(workOrders.tenantId, tenantId),
          lt(workOrders.dueAt, now),
          sql`${workOrders.status} NOT IN ('delivered', 'canceled')`,
        ),
      );

    const totalOrders = statusResult.reduce((acc, r) => acc + r.count, 0);
    const delivered = statusResult.find((r) => r.status === 'delivered')?.count ?? 0;

    return {
      statuses: statusResult,
      overdueCount: overdue!.value,
      deliveryRate: totalOrders > 0 ? Math.round((delivered / totalOrders) * 1000) / 10 : 0,
    };
  }

  async getBriefingCompletion(tenantId: string) {
    const result = await this.db
      .select({
        status: leadQualification.status,
        count: count(),
      })
      .from(leadQualification)
      .where(eq(leadQualification.tenantId, tenantId))
      .groupBy(leadQualification.status);

    const statusMap: Record<string, number> = {};
    for (const r of result) statusMap[r.status] = r.count;
    const total = result.reduce((acc, r) => acc + r.count, 0);
    const completed = statusMap['completed'] ?? 0;

    return {
      pending: statusMap['pending'] ?? 0,
      sent: statusMap['sent'] ?? 0,
      completed,
      completionRate: total > 0 ? Math.round((completed / total) * 1000) / 10 : 0,
    };
  }

  async getRecentActivity(tenantId: string, limit = 20) {
    return this.db
      .select({
        id: events.id,
        entityType: events.entityType,
        entityId: events.entityId,
        eventType: events.eventType,
        source: events.source,
        createdAt: events.createdAt,
      })
      .from(events)
      .where(eq(events.tenantId, tenantId))
      .orderBy(desc(events.createdAt))
      .limit(limit);
  }

  async getPipelinePerformance(tenantId: string, pipelineId: string) {
    const [pipeline] = await this.db
      .select({ id: pipelines.id, name: pipelines.name })
      .from(pipelines)
      .where(and(eq(pipelines.id, pipelineId), eq(pipelines.tenantId, tenantId)))
      .limit(1);

    if (!pipeline) return null;

    // Total leads in pipeline
    const [totalLeadsResult] = await this.db
      .select({ value: count() })
      .from(leadStage)
      .where(eq(leadStage.pipelineId, pipelineId));
    const totalLeads = totalLeadsResult!.value;

    // Stage distribution with avg days
    const stageRows = await this.db
      .select({
        stageId: stages.id,
        stageName: stages.name,
        stagePosition: stages.position,
        count: count(),
        avgDays: sql<number>`AVG(EXTRACT(EPOCH FROM (NOW() - ${leadStage.enteredAt})) / 86400)`,
      })
      .from(leadStage)
      .innerJoin(stages, eq(leadStage.stageId, stages.id))
      .where(eq(leadStage.pipelineId, pipelineId))
      .groupBy(stages.id, stages.name, stages.position)
      .orderBy(stages.position);

    // Stale leads (no movement in 7+ days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const [staleResult] = await this.db
      .select({ value: count() })
      .from(leadStage)
      .where(and(eq(leadStage.pipelineId, pipelineId), lt(leadStage.updatedAt, sevenDaysAgo)));

    // Revenue from leads in this pipeline
    const revenueResult = await this.db
      .select({ total: sum(paymentIntents.amount), deals: count() })
      .from(paymentIntents)
      .innerJoin(leads, eq(paymentIntents.leadId, leads.id))
      .innerJoin(leadStage, and(eq(leadStage.leadId, leads.id), eq(leadStage.pipelineId, pipelineId)))
      .where(and(eq(paymentIntents.tenantId, tenantId), eq(paymentIntents.status, 'paid')));

    const rev = revenueResult[0];
    const revenueTotal = Number(rev?.total || 0);
    const revDeals = rev?.deals ?? 0;

    // Lead sources from qualifications of leads in pipeline
    const sources = await this.db
      .select({
        source: leadQualification.howFoundUs,
        count: count(),
      })
      .from(leadQualification)
      .innerJoin(leads, eq(leadQualification.leadId, leads.id))
      .innerJoin(leadStage, and(eq(leadStage.leadId, leads.id), eq(leadStage.pipelineId, pipelineId)))
      .where(eq(leadQualification.tenantId, tenantId))
      .groupBy(leadQualification.howFoundUs)
      .orderBy(desc(count()))
      .limit(5);

    return {
      pipeline: { id: pipeline.id, name: pipeline.name },
      totalLeads,
      conversionRate: totalLeads > 0 ? Math.round((revDeals / totalLeads) * 1000) / 10 : 0,
      averageTicket: revDeals > 0 ? Math.round((revenueTotal / revDeals) * 100) / 100 : 0,
      revenueTotal,
      stageDistribution: stageRows.map((s) => ({
        stage: s.stageName,
        count: s.count,
        avgDaysInStage: Math.round(Number(s.avgDays || 0) * 10) / 10,
      })),
      staleLeads: staleResult!.value,
      topSources: sources.filter((s) => s.source).map((s) => ({ source: s.source, count: s.count })),
    };
  }
}
