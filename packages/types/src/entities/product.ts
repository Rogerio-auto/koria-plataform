/** core.products */
export interface Product {
  id: string;
  tenantId: string;
  name: string;
  category: string | null;
  defaultCurrency: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

/** core.product_prices */
export interface ProductPrice {
  id: string;
  productId: string;
  currency: string;
  priceAmount: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Product with prices (joined) */
export interface ProductWithPrices extends Product {
  prices: ProductPrice[];
}
