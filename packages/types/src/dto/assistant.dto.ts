/**
 * Assistant DTOs — Chat messages and action requests.
 */
export interface SendMessageDto {
  conversationId?: string;
  message: string;
}

export interface AssistantResponse {
  conversationId: string;
  reply: string;
  actions?: Array<{
    type: string;
    description: string;
    success: boolean;
  }>;
}
