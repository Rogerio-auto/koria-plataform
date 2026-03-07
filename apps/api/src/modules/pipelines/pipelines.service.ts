import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and, asc, inArray } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_CONNECTION } from '../database/database.module';
import { pipelines, stages } from '@koria/database';

@Injectable()
export class PipelinesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: PostgresJsDatabase,
  ) {}

  async findAllPipelines(tenantId: string) {
    const pipelineRows = await this.db
      .select()
      .from(pipelines)
      .where(eq(pipelines.tenantId, tenantId))
      .orderBy(pipelines.name);

    const pipelineIds = pipelineRows.map((p) => p.id);
    const stageRows =
      pipelineIds.length > 0
        ? await this.db
            .select()
            .from(stages)
            .where(inArray(stages.pipelineId, pipelineIds))
            .orderBy(asc(stages.position))
        : [];

    const stageMap = new Map<string, typeof stageRows>();
    for (const s of stageRows) {
      const arr = stageMap.get(s.pipelineId) || [];
      arr.push(s);
      stageMap.set(s.pipelineId, arr);
    }

    return pipelineRows.map((p) => ({
      ...p,
      stages: stageMap.get(p.id) || [],
    }));
  }

  async findOnePipeline(tenantId: string, id: string) {
    const [pipeline] = await this.db
      .select()
      .from(pipelines)
      .where(and(eq(pipelines.id, id), eq(pipelines.tenantId, tenantId)))
      .limit(1);

    if (!pipeline) throw new NotFoundException('Pipeline não encontrado');

    const stageRows = await this.db
      .select()
      .from(stages)
      .where(eq(stages.pipelineId, id))
      .orderBy(asc(stages.position));

    return { ...pipeline, stages: stageRows };
  }

  async createPipeline(tenantId: string, data: { name: string }) {
    const [pipeline] = await this.db
      .insert(pipelines)
      .values({ tenantId, name: data.name })
      .returning();

    return { ...pipeline!, stages: [] };
  }

  async updatePipeline(tenantId: string, id: string, data: { name?: string }) {
    const [existing] = await this.db
      .select()
      .from(pipelines)
      .where(and(eq(pipelines.id, id), eq(pipelines.tenantId, tenantId)))
      .limit(1);

    if (!existing) throw new NotFoundException('Pipeline não encontrado');

    if (data.name) {
      await this.db
        .update(pipelines)
        .set({ name: data.name })
        .where(eq(pipelines.id, id));
    }

    return this.findOnePipeline(tenantId, id);
  }

  async removePipeline(tenantId: string, id: string) {
    const [existing] = await this.db
      .select()
      .from(pipelines)
      .where(and(eq(pipelines.id, id), eq(pipelines.tenantId, tenantId)))
      .limit(1);

    if (!existing) throw new NotFoundException('Pipeline não encontrado');

    await this.db.delete(pipelines).where(eq(pipelines.id, id));
    return { success: true };
  }

  // --- Stages ---

  async createStage(
    tenantId: string,
    data: { pipelineId: string; name: string; code: string; position?: number; isTerminal?: boolean },
  ) {
    // Verify pipeline belongs to tenant
    const [pipeline] = await this.db
      .select()
      .from(pipelines)
      .where(and(eq(pipelines.id, data.pipelineId), eq(pipelines.tenantId, tenantId)))
      .limit(1);

    if (!pipeline) throw new NotFoundException('Pipeline não encontrado');

    try {
      const [stage] = await this.db
        .insert(stages)
        .values({
          pipelineId: data.pipelineId,
          name: data.name,
          code: data.code,
          position: data.position ?? 0,
          isTerminal: data.isTerminal ?? false,
        })
        .returning();

      return stage;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao criar etapa';
      throw new BadRequestException(message);
    }
  }

  async updateStage(
    tenantId: string,
    stageId: string,
    data: { name?: string; code?: string; position?: number; isTerminal?: boolean },
  ) {
    // Get stage and verify tenant owns the pipeline
    const [stage] = await this.db
      .select()
      .from(stages)
      .where(eq(stages.id, stageId))
      .limit(1);

    if (!stage) throw new NotFoundException('Etapa não encontrada');

    const [pipeline] = await this.db
      .select()
      .from(pipelines)
      .where(and(eq(pipelines.id, stage.pipelineId), eq(pipelines.tenantId, tenantId)))
      .limit(1);

    if (!pipeline) throw new NotFoundException('Pipeline não encontrado');

    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.code !== undefined) updates.code = data.code;
    if (data.position !== undefined) updates.position = data.position;
    if (data.isTerminal !== undefined) updates.isTerminal = data.isTerminal;

    if (Object.keys(updates).length > 0) {
      await this.db.update(stages).set(updates).where(eq(stages.id, stageId));
    }

    const [updated] = await this.db.select().from(stages).where(eq(stages.id, stageId));
    return updated;
  }

  async removeStage(tenantId: string, stageId: string) {
    const [stage] = await this.db
      .select()
      .from(stages)
      .where(eq(stages.id, stageId))
      .limit(1);

    if (!stage) throw new NotFoundException('Etapa não encontrada');

    const [pipeline] = await this.db
      .select()
      .from(pipelines)
      .where(and(eq(pipelines.id, stage.pipelineId), eq(pipelines.tenantId, tenantId)))
      .limit(1);

    if (!pipeline) throw new NotFoundException('Pipeline não encontrado');

    await this.db.delete(stages).where(eq(stages.id, stageId));
    return { success: true };
  }

  async reorderStages(
    tenantId: string,
    pipelineId: string,
    stagesOrder: Array<{ id: string; position: number }>,
  ) {
    const [pipeline] = await this.db
      .select()
      .from(pipelines)
      .where(and(eq(pipelines.id, pipelineId), eq(pipelines.tenantId, tenantId)))
      .limit(1);

    if (!pipeline) throw new NotFoundException('Pipeline não encontrado');

    for (const s of stagesOrder) {
      await this.db
        .update(stages)
        .set({ position: s.position })
        .where(and(eq(stages.id, s.id), eq(stages.pipelineId, pipelineId)));
    }

    return this.findOnePipeline(tenantId, pipelineId);
  }
}
