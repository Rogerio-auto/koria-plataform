/**
 * Assistant entity — AI assistant conversations and action logs.
 */
export interface AssistantMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface AssistantConversation {
  id: string;
  tenantId: string;
  userId: string;
  messages: AssistantMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AssistantActionLog {
  id: string;
  tenantId: string;
  userId: string;
  conversationId: string | null;
  actionType: string;
  actionInput: Record<string, unknown> | null;
  actionOutput: Record<string, unknown> | null;
  success: boolean;
  errorMessage: string | null;
  executedAt: string;
}
