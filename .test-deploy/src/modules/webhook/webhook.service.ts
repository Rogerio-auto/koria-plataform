import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';

export interface WebhookFilePayload {
  fileName: string;
  mimeType: string;
  fileSize: number;
  url: string;
  base64?: string;
}

export interface WebhookPayload {
  workOrderId: string;
  leadName: string | null;
  externalTaskId: string | null;
  files: WebhookFilePayload[];
  timestamp: string;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly n8nWebhookUrl: string;

  constructor(private readonly config: ConfigService) {
    this.n8nWebhookUrl = this.config.get<string>('N8N_WEBHOOK_URL', '');
    if (!this.n8nWebhookUrl) {
      this.logger.warn('N8N_WEBHOOK_URL not configured — webhooks will be skipped');
    }
  }

  /**
   * Send file data to the N8N OCR webhook.
   */
  async sendToOcrAgent(payload: WebhookPayload): Promise<boolean> {
    if (!this.n8nWebhookUrl) {
      this.logger.warn('N8N webhook URL not configured, skipping');
      return false;
    }

    try {
      const response = await fetch(this.n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        this.logger.error(
          `N8N webhook failed (${response.status}): ${await response.text()}`,
        );
        return false;
      }

      this.logger.log(
        `N8N webhook sent successfully for work order ${payload.workOrderId} (${payload.files.length} files)`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Failed to send N8N webhook: ${error}`);
      return false;
    }
  }
}
