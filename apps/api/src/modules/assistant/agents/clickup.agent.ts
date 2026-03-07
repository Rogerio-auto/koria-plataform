import { Injectable } from '@nestjs/common';
import { ClickupService } from '../../clickup/clickup.service';

@Injectable()
export class ClickupAgent {
  constructor(private readonly clickupService: ClickupService) {}

  async execute(_tenantId: string, query: string): Promise<string> {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('atualiza') || lowerQuery.includes('mover') || lowerQuery.includes('status')) {
      return this.updateTaskStatus(query);
    }

    return '📋 Posso ajudar a atualizar tasks no ClickUp. Exemplo: "Atualiza a task do Pedro para em produção"';
  }

  private async updateTaskStatus(query: string): Promise<string> {
    const statusMatch = query.match(/(?:para|pra)\s+['"]?(.+?)['"]?\s*$/i);
    const newStatus = statusMatch?.[1]?.trim();

    if (!newStatus) {
      return '❓ Para qual status devo atualizar? Exemplo: "Atualiza a task do Pedro para em produção"';
    }

    // TODO: integrate with this.clickupService when task IDs are available from the conversation context
    void this.clickupService;
    return `⚠️ Para atualizar tasks no ClickUp, preciso do ID da task. Acesse o dashboard de Work Orders para gerenciar tasks.`;
  }
}
