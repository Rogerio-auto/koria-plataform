import { QuoteStatus } from '../enums';

/** core.quotes */
export interface Quote {
  id: string;
  tenantId: string;
  leadId: string;
  conversationId: string | null;
  status: QuoteStatus;
  currency: string;
  subtotal: number;
  discount: number;
  total: number;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

/** core.quote_items */
export interface QuoteItem {
  id: string;
  quoteId: string;
  productId: string | null;
  qty: number;
  unitPrice: number;
  total: number;
  metadata: Record<string, unknown>;
}

/** Quote with items (joined) */
export interface QuoteWithItems extends Quote {
  items: QuoteItem[];
}
