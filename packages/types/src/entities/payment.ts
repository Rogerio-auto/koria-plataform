import { PaymentProvider, PaymentStatus } from '../enums';

/** core.payment_intents */
export interface PaymentIntent {
  id: string;
  tenantId: string;
  leadId: string;
  quoteId: string | null;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  currency: string;
  providerRef: string | null;
  payUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/** core.payment_events */
export interface PaymentEvent {
  id: string;
  paymentIntentId: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
}
