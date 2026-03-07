// Enums — mirroring core PostgreSQL enum types

export enum LeadType {
  Person = 'person',
  Company = 'company',
}

export enum ChannelType {
  WhatsApp = 'whatsapp',
  Instagram = 'instagram',
  Messenger = 'messenger',
  Email = 'email',
}

export enum ConversationState {
  Open = 'open',
  Pending = 'pending',
  Closed = 'closed',
}

export enum LeadStatus {
  Active = 'active',
  Archived = 'archived',
  Blocked = 'blocked',
}

export enum QuoteStatus {
  Draft = 'draft',
  Sent = 'sent',
  Accepted = 'accepted',
  Rejected = 'rejected',
  Expired = 'expired',
}

export enum PaymentProvider {
  Stripe = 'stripe',
  Wise = 'wise',
}

export enum PaymentStatus {
  Pending = 'pending',
  Paid = 'paid',
  Failed = 'failed',
  Canceled = 'canceled',
}

export enum WorkOrderStatus {
  Created = 'created',
  InProgress = 'in_progress',
  PreviewSent = 'preview_sent',
  ChangesRequested = 'changes_requested',
  Approved = 'approved',
  Delivered = 'delivered',
  Canceled = 'canceled',
}

export enum FollowupStatus {
  Scheduled = 'scheduled',
  Sent = 'sent',
  Canceled = 'canceled',
  Failed = 'failed',
}

export enum MessageDirection {
  In = 'in',
  Out = 'out',
}

export enum MessageType {
  Text = 'text',
  Template = 'template',
  Media = 'media',
}

export enum TemplateCategory {
  Marketing = 'marketing',
  Utility = 'utility',
  Auth = 'auth',
}

export enum UserRole {
  Admin = 'admin',
  Manager = 'manager',
  Sdr = 'sdr',
  Viewer = 'viewer',
}

export enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export enum EventEntityType {
  Lead = 'lead',
  Conversation = 'conversation',
  Quote = 'quote',
  PaymentIntent = 'payment_intent',
  WorkOrder = 'work_order',
}

export enum LeadQualificationStatus {
  Pending = 'pending',
  Sent = 'sent',
  Completed = 'completed',
}

export enum CommunicationTone {
  Sophisticated = 'sophisticated',
  Young = 'young',
  Family = 'family',
  Investor = 'investor',
}

export enum TargetAudience {
  YoungCouples = 'young_couples',
  Investors = 'investors',
  Families = 'families',
  Luxury = 'luxury',
  FirstHome = 'first_home',
}

export enum MainEmotion {
  Security = 'security',
  Freedom = 'freedom',
  Sophistication = 'sophistication',
  Nature = 'nature',
  Comfort = 'comfort',
  Exclusivity = 'exclusivity',
}
