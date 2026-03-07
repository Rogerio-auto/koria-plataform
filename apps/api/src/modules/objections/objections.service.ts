import { Injectable, Inject } from '@nestjs/common';
import { eq, and, gte, lte, count, sql, desc } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_CONNECTION } from '../database/database.module';
import { objections, objectionCategories, leads } from '@koria/database';

@Injectable()
export class ObjectionsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: PostgresJsDatabase,
  ) {}

  async getOverview(tenantId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 86400000);
    const end = endDate ? new Date(endDate) : new Date();

    const [total] = await this.db
      .select({ value: count() })
      .from(objections)
      .where(
        and(
          eq(objections.tenantId, tenantId),
          gte(objections.detectedAt, start),
          lte(objections.detectedAt, end),
        ),
      );

    const [overcome] = await this.db
      .select({ value: count() })
      .from(objections)
      .where(
        and(
          eq(objections.tenantId, tenantId),
          eq(objections.wasOvercome, true),
          gte(objections.detectedAt, start),
          lte(objections.detectedAt, end),
        ),
      );

    const categories = await this.db
      .select({
        category: objections.category,
        total: count(),
        overcome: sql<number>`COUNT(*) FILTER (WHERE ${objections.wasOvercome} = true)`,
      })
      .from(objections)
      .where(
        and(
          eq(objections.tenantId, tenantId),
          gte(objections.detectedAt, start),
          lte(objections.detectedAt, end),
        ),
      )
      .groupBy(objections.category)
      .orderBy(desc(count()));

    const catMap = new Map<string, string>();
    const cats = await this.db
      .select({ slug: objectionCategories.slug, name: objectionCategories.name })
      .from(objectionCategories)
      .where(eq(objectionCategories.tenantId, tenantId));
    for (const c of cats) catMap.set(c.slug, c.name);

    const totalCount = total!.value;
    const overcomeCount = overcome!.value;

    return {
      totalObjections: totalCount,
      overcomeRate: totalCount > 0 ? Math.round((overcomeCount / totalCount) * 100) : 0,
      topCategories: categories.map((c) => ({
        slug: c.category,
        name: catMap.get(c.category) || c.category,
        total: c.total,
        overcome: Number(c.overcome),
        overcomeRate: c.total > 0 ? Math.round((Number(c.overcome) / c.total) * 100) : 0,
      })),
    };
  }

  async getByPeriod(tenantId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 86400000);
    const end = endDate ? new Date(endDate) : new Date();

    return this.db
      .select({
        date: sql<string>`DATE(${objections.detectedAt})`.as('date'),
        category: objections.category,
        count: count(),
      })
      .from(objections)
      .where(
        and(
          eq(objections.tenantId, tenantId),
          gte(objections.detectedAt, start),
          lte(objections.detectedAt, end),
        ),
      )
      .groupBy(sql`DATE(${objections.detectedAt})`, objections.category)
      .orderBy(sql`DATE(${objections.detectedAt})`);
  }

  async getDrilldown(tenantId: string, category: string) {
    const catResult = await this.db
      .select()
      .from(objectionCategories)
      .where(
        and(
          eq(objectionCategories.tenantId, tenantId),
          eq(objectionCategories.slug, category),
        ),
      )
      .limit(1);

    const cat = catResult[0];

    const objResult = await this.db
      .select({
        id: objections.id,
        leadId: objections.leadId,
        originalText: objections.originalText,
        wasOvercome: objections.wasOvercome,
        detectedAt: objections.detectedAt,
        leadName: leads.displayName,
      })
      .from(objections)
      .leftJoin(leads, eq(objections.leadId, leads.id))
      .where(
        and(eq(objections.tenantId, tenantId), eq(objections.category, category)),
      )
      .orderBy(desc(objections.detectedAt))
      .limit(100);

    const total = objResult.length;
    const overcomeCount = objResult.filter((o) => o.wasOvercome).length;

    return {
      category,
      categoryName: cat?.name || category,
      total,
      overcomeRate: total > 0 ? Math.round((overcomeCount / total) * 100) : 0,
      objections: objResult.map((o) => ({
        id: o.id,
        leadName: o.leadName,
        originalText: o.originalText,
        wasOvercome: o.wasOvercome,
        detectedAt: o.detectedAt,
        suggestedResponse: cat?.suggestedResponse || null,
      })),
    };
  }

  async getCategories(tenantId: string) {
    return this.db
      .select()
      .from(objectionCategories)
      .where(
        and(eq(objectionCategories.tenantId, tenantId), eq(objectionCategories.isActive, true)),
      )
      .orderBy(objectionCategories.displayOrder);
  }
}
