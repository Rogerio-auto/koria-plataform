import { ChannelType, ConversationState, MessageDirection, MessageType, TemplateCategory } from '../enums';

/** core.conversations */
export interface Conversation {
  id: string;
  tenantId: string;
  leadId: string;
  channel: ChannelType;
  externalThreadId: string | null;
  state: ConversationState;
  assignedTo: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** core.messages */
export interface Message {
  id: string;
  tenantId: string;
  conversationId: string;
  leadId: string;
  direction: MessageDirection;
  channel: ChannelType;
  providerMessageId: string | null;
  messageType: MessageType;
  templateCategory: TemplateCategory | null;
  waConversationId: string | null;
  costAmount: number | null;
  costCurrency: string;
  content: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}
