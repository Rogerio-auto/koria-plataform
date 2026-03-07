import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and, ilike } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_CONNECTION } from '../database/database.module';
import { products, productPrices } from '@koria/database';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: PostgresJsDatabase,
  ) {}

  async findAll(tenantId: string, search?: string) {
    const conditions = [eq(products.tenantId, tenantId)];
    if (search) {
      conditions.push(ilike(products.name, `%${search}%`));
    }

    const rows = await this.db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(products.name);

    // Get all prices at once, then group by productId
    const productIds = rows.map((r) => r.id);
    const allPrices =
      productIds.length > 0
        ? await this.db.select().from(productPrices)
        : [];

    const priceMap = new Map<string, typeof allPrices>();
    for (const p of allPrices) {
      if (!productIds.includes(p.productId)) continue;
      const arr = priceMap.get(p.productId) || [];
      arr.push(p);
      priceMap.set(p.productId, arr);
    }

    return rows.map((r) => ({
      ...r,
      prices: (priceMap.get(r.id) || []).map((p) => ({
        ...p,
        priceAmount: Number(p.priceAmount),
      })),
    }));
  }

  async findOne(tenantId: string, id: string) {
    const [product] = await this.db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
      .limit(1);

    if (!product) throw new NotFoundException('Produto não encontrado');

    const prices = await this.db
      .select()
      .from(productPrices)
      .where(eq(productPrices.productId, id));

    return {
      ...product,
      prices: prices.map((p) => ({ ...p, priceAmount: Number(p.priceAmount) })),
    };
  }

  async create(
    tenantId: string,
    data: {
      name: string;
      category?: string;
      defaultCurrency?: string;
      metadata?: Record<string, unknown>;
      prices?: Array<{ currency: string; priceAmount: string; isDefault?: boolean }>;
    },
  ) {
    const [product] = await this.db
      .insert(products)
      .values({
        tenantId,
        name: data.name,
        category: data.category || null,
        defaultCurrency: data.defaultCurrency || 'BRL',
        metadata: data.metadata || {},
      })
      .returning();

    if (data.prices && data.prices.length > 0) {
      await this.db.insert(productPrices).values(
        data.prices.map((p) => ({
          productId: product!.id,
          currency: p.currency,
          priceAmount: p.priceAmount,
          isDefault: p.isDefault ?? false,
        })),
      );
    }

    return this.findOne(tenantId, product!.id);
  }

  async update(
    tenantId: string,
    id: string,
    data: {
      name?: string;
      category?: string;
      defaultCurrency?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    const [existing] = await this.db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
      .limit(1);

    if (!existing) throw new NotFoundException('Produto não encontrado');

    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.category !== undefined) updates.category = data.category;
    if (data.defaultCurrency !== undefined) updates.defaultCurrency = data.defaultCurrency;
    if (data.metadata !== undefined) updates.metadata = data.metadata;

    if (Object.keys(updates).length > 0) {
      await this.db
        .update(products)
        .set(updates)
        .where(eq(products.id, id));
    }

    return this.findOne(tenantId, id);
  }

  async remove(tenantId: string, id: string) {
    const [existing] = await this.db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
      .limit(1);

    if (!existing) throw new NotFoundException('Produto não encontrado');

    await this.db.delete(products).where(eq(products.id, id));
    return { success: true };
  }

  // --- Price management ---

  async addPrice(
    tenantId: string,
    productId: string,
    data: { currency: string; priceAmount: string; isDefault?: boolean },
  ) {
    // Verify product belongs to tenant
    const [product] = await this.db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)))
      .limit(1);

    if (!product) throw new NotFoundException('Produto não encontrado');

    // If setting as default, unset others
    if (data.isDefault) {
      await this.db
        .update(productPrices)
        .set({ isDefault: false })
        .where(eq(productPrices.productId, productId));
    }

    const [price] = await this.db
      .insert(productPrices)
      .values({
        productId,
        currency: data.currency,
        priceAmount: data.priceAmount,
        isDefault: data.isDefault ?? false,
      })
      .returning();

    return { ...price!, priceAmount: Number(price!.priceAmount) };
  }

  async updatePrice(
    tenantId: string,
    productId: string,
    priceId: string,
    data: { currency?: string; priceAmount?: string; isDefault?: boolean },
  ) {
    const [product] = await this.db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)))
      .limit(1);

    if (!product) throw new NotFoundException('Produto não encontrado');

    const [existing] = await this.db
      .select()
      .from(productPrices)
      .where(and(eq(productPrices.id, priceId), eq(productPrices.productId, productId)))
      .limit(1);

    if (!existing) throw new NotFoundException('Preço não encontrado');

    if (data.isDefault) {
      await this.db
        .update(productPrices)
        .set({ isDefault: false })
        .where(eq(productPrices.productId, productId));
    }

    const updates: Record<string, unknown> = {};
    if (data.currency !== undefined) updates.currency = data.currency;
    if (data.priceAmount !== undefined) updates.priceAmount = data.priceAmount;
    if (data.isDefault !== undefined) updates.isDefault = data.isDefault;
    updates.updatedAt = new Date();

    await this.db
      .update(productPrices)
      .set(updates)
      .where(eq(productPrices.id, priceId));

    const [updated] = await this.db
      .select()
      .from(productPrices)
      .where(eq(productPrices.id, priceId));

    return { ...updated!, priceAmount: Number(updated!.priceAmount) };
  }

  async removePrice(tenantId: string, productId: string, priceId: string) {
    const [product] = await this.db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)))
      .limit(1);

    if (!product) throw new NotFoundException('Produto não encontrado');

    await this.db
      .delete(productPrices)
      .where(and(eq(productPrices.id, priceId), eq(productPrices.productId, productId)));

    return { success: true };
  }
}
