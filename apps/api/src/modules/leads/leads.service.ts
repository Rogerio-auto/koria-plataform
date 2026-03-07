import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and, ilike, count, desc, asc } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_CONNECTION } from '../database/database.module';
import {
  leads,
  contactPoints,
  leadStage,
  stages,
  pipelines,
  leadQualification,
} from '@koria/database';

@Injectable()
export class LeadsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: PostgresJsDatabase,
  ) {}

  async findAll(
    tenantId: string,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      pipelineId?: string;
      stageId?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 25, 100);
    const offset = (page - 1) * limit;

    const conditions = [eq(leads.tenantId, tenantId)];
    if (query.search) {
      conditions.push(ilike(leads.displayName, `%${query.search}%`));
    }
    if (query.status) {
      conditions.push(eq(leads.status, query.status as 'active' | 'archived' | 'blocked'));
    }

    const whereClause = and(...conditions);

    const [total] = await this.db
      .select({ value: count() })
      .from(leads)
      .where(whereClause);

    const orderCol =
      query.sortBy === 'name' ? leads.displayName :
      query.sortBy === 'score' ? leads.score :
      leads.createdAt;
    const orderFn = query.sortOrder === 'asc' ? asc : desc;

    const rows = await this.db
      .select()
      .from(leads)
      .where(whereClause)
      .orderBy(orderFn(orderCol))
      .limit(limit)
      .offset(offset);

    // Get contact points for these leads
    const leadIds = rows.map((r) => r.id);
    const contacts =
      leadIds.length > 0
        ? await this.db.select().from(contactPoints)
        : [];

    const contactMap = new Map<string, typeof contacts>();
    for (const c of contacts) {
      if (!leadIds.includes(c.leadId)) continue;
      const arr = contactMap.get(c.leadId) || [];
      arr.push(c);
      contactMap.set(c.leadId, arr);
    }

    // Get current stage for these leads
    const stageRows =
      leadIds.length > 0
        ? await this.db
            .select({
              leadId: leadStage.leadId,
              pipelineId: leadStage.pipelineId,
              stageId: leadStage.stageId,
              stageName: stages.name,
              stageCode: stages.code,
              pipelineName: pipelines.name,
            })
            .from(leadStage)
            .innerJoin(stages, eq(leadStage.stageId, stages.id))
            .innerJoin(pipelines, eq(leadStage.pipelineId, pipelines.id))
        : [];

    // Filter by pipeline/stage if requested
    let filteredLeadIds: Set<string> | null = null;
    if (query.stageId) {
      filteredLeadIds = new Set(stageRows.filter((s) => s.stageId === query.stageId).map((s) => s.leadId));
    } else if (query.pipelineId) {
      filteredLeadIds = new Set(stageRows.filter((s) => s.pipelineId === query.pipelineId).map((s) => s.leadId));
    }

    const stageMap = new Map<string, typeof stageRows>();
    for (const s of stageRows) {
      if (!leadIds.includes(s.leadId)) continue;
      const arr = stageMap.get(s.leadId) || [];
      arr.push(s);
      stageMap.set(s.leadId, arr);
    }

    let data = rows.map((r) => ({
      ...r,
      contactPoints: contactMap.get(r.id) || [],
      stages: stageMap.get(r.id) || [],
    }));

    if (filteredLeadIds) {
      data = data.filter((d) => filteredLeadIds!.has(d.id));
    }

    const totalCount = total!.value;

    return {
      data,
      meta: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const [lead] = await this.db
      .select()
      .from(leads)
      .where(and(eq(leads.id, id), eq(leads.tenantId, tenantId)))
      .limit(1);

    if (!lead) throw new NotFoundException('Lead não encontrado');

    const contacts = await this.db
      .select()
      .from(contactPoints)
      .where(eq(contactPoints.leadId, id));

    const stageRows = await this.db
      .select({
        leadId: leadStage.leadId,
        pipelineId: leadStage.pipelineId,
        stageId: leadStage.stageId,
        stageName: stages.name,
        stageCode: stages.code,
        stagePosition: stages.position,
        pipelineName: pipelines.name,
        enteredAt: leadStage.enteredAt,
      })
      .from(leadStage)
      .innerJoin(stages, eq(leadStage.stageId, stages.id))
      .innerJoin(pipelines, eq(leadStage.pipelineId, pipelines.id))
      .where(eq(leadStage.leadId, id));

    const [qualification] = await this.db
      .select()
      .from(leadQualification)
      .where(eq(leadQualification.leadId, id))
      .limit(1);

    return {
      ...lead,
      contactPoints: contacts,
      stages: stageRows,
      qualification: qualification || null,
    };
  }

  async create(
    tenantId: string,
    data: {
      type?: string;
      displayName?: string;
      preferredLanguage?: string;
      countryCode?: string;
      vipLevel?: number;
      score?: number;
      contactPoints?: Array<{ channel: string; handle: string; isPrimary?: boolean; metadata?: Record<string, unknown> }>;
    },
  ) {
    const [lead] = await this.db
      .insert(leads)
      .values({
        tenantId,
        type: (data.type as 'person' | 'company') || 'person',
        displayName: data.displayName || null,
        preferredLanguage: data.preferredLanguage || null,
        countryCode: data.countryCode || null,
        vipLevel: data.vipLevel ?? 0,
        score: data.score ?? 0,
      })
      .returning();

    if (data.contactPoints && data.contactPoints.length > 0) {
      await this.db.insert(contactPoints).values(
        data.contactPoints.map((cp) => ({
          tenantId,
          leadId: lead!.id,
          channel: cp.channel as 'whatsapp' | 'instagram' | 'messenger' | 'email',
          handle: cp.handle,
          isPrimary: cp.isPrimary ?? false,
          metadata: cp.metadata || {},
        })),
      );
    }

    return this.findOne(tenantId, lead!.id);
  }

  async update(
    tenantId: string,
    id: string,
    data: {
      type?: string;
      displayName?: string;
      preferredLanguage?: string;
      countryCode?: string;
      vipLevel?: number;
      score?: number;
      status?: string;
    },
  ) {
    const [existing] = await this.db
      .select()
      .from(leads)
      .where(and(eq(leads.id, id), eq(leads.tenantId, tenantId)))
      .limit(1);

    if (!existing) throw new NotFoundException('Lead não encontrado');

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (data.type !== undefined) updates.type = data.type;
    if (data.displayName !== undefined) updates.displayName = data.displayName;
    if (data.preferredLanguage !== undefined) updates.preferredLanguage = data.preferredLanguage;
    if (data.countryCode !== undefined) updates.countryCode = data.countryCode;
    if (data.vipLevel !== undefined) updates.vipLevel = data.vipLevel;
    if (data.score !== undefined) updates.score = data.score;
    if (data.status !== undefined) updates.status = data.status;

    await this.db.update(leads).set(updates).where(eq(leads.id, id));

    return this.findOne(tenantId, id);
  }

  async remove(tenantId: string, id: string) {
    const [existing] = await this.db
      .select()
      .from(leads)
      .where(and(eq(leads.id, id), eq(leads.tenantId, tenantId)))
      .limit(1);

    if (!existing) throw new NotFoundException('Lead não encontrado');

    await this.db.delete(leads).where(eq(leads.id, id));
    return { success: true };
  }

  async moveStage(
    tenantId: string,
    leadId: string,
    pipelineId: string,
    stageId: string,
  ) {
    const [lead] = await this.db
      .select()
      .from(leads)
      .where(and(eq(leads.id, leadId), eq(leads.tenantId, tenantId)))
      .limit(1);

    if (!lead) throw new NotFoundException('Lead não encontrado');

    // Upsert lead_stage (composite PK: leadId + pipelineId)
    const [existing] = await this.db
      .select()
      .from(leadStage)
      .where(and(eq(leadStage.leadId, leadId), eq(leadStage.pipelineId, pipelineId)))
      .limit(1);

    if (existing) {
      await this.db
        .update(leadStage)
        .set({ stageId, updatedAt: new Date() })
        .where(and(eq(leadStage.leadId, leadId), eq(leadStage.pipelineId, pipelineId)));
    } else {
      await this.db.insert(leadStage).values({
        tenantId,
        leadId,
        pipelineId,
        stageId,
      });
    }

    return this.findOne(tenantId, leadId);
  }

  async addContactPoint(
    tenantId: string,
    leadId: string,
    data: { channel: string; handle: string; isPrimary?: boolean; metadata?: Record<string, unknown> },
  ) {
    const [lead] = await this.db
      .select()
      .from(leads)
      .where(and(eq(leads.id, leadId), eq(leads.tenantId, tenantId)))
      .limit(1);

    if (!lead) throw new NotFoundException('Lead não encontrado');

    const [cp] = await this.db
      .insert(contactPoints)
      .values({
        tenantId,
        leadId,
        channel: data.channel as 'whatsapp' | 'instagram' | 'messenger' | 'email',
        handle: data.handle,
        isPrimary: data.isPrimary ?? false,
        metadata: data.metadata || {},
      })
      .returning();

    return cp;
  }

  async removeContactPoint(tenantId: string, leadId: string, contactId: string) {
    const [lead] = await this.db
      .select()
      .from(leads)
      .where(and(eq(leads.id, leadId), eq(leads.tenantId, tenantId)))
      .limit(1);

    if (!lead) throw new NotFoundException('Lead não encontrado');

    await this.db
      .delete(contactPoints)
      .where(and(eq(contactPoints.id, contactId), eq(contactPoints.leadId, leadId)));

    return { success: true };
  }
}
