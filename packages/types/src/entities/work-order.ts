import { WorkOrderStatus } from '../enums';

/** core.work_orders */
export interface WorkOrder {
  id: string;
  tenantId: string;
  leadId: string;
  quoteId: string | null;
  paymentIntentId: string | null;
  status: WorkOrderStatus;
  dueAt: string | null;
  externalTaskId: string | null;
  briefing: Record<string, unknown>;
  uploadToken: string | null;
  createdAt: string;
  updatedAt: string;
}

/** core.work_order_assets */
export interface WorkOrderAsset {
  id: string;
  workOrderId: string;
  type: string;
  url: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

/** core.approvals */
export interface Approval {
  id: string;
  workOrderId: string;
  status: 'pending' | 'approved' | 'rejected';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** core.vw_work_orders (view) */
export interface WorkOrderView {
  tenantId: string;
  workOrderId: string;
  status: WorkOrderStatus;
  dueAt: string | null;
  externalTaskId: string | null;
  createdAt: string;
  updatedAt: string;
  leadId: string;
  displayName: string | null;
  countryCode: string | null;
  quoteId: string | null;
  paymentIntentId: string | null;
}
