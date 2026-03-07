export interface CreateProductDto {
  name: string;
  category?: string;
  defaultCurrency?: string;
  metadata?: Record<string, unknown>;
  prices?: CreateProductPriceDto[];
}

export interface UpdateProductDto {
  name?: string;
  category?: string;
  defaultCurrency?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateProductPriceDto {
  currency: string;
  priceAmount: string;
  isDefault?: boolean;
}

export interface UpdateProductPriceDto {
  currency?: string;
  priceAmount?: string;
  isDefault?: boolean;
}
