import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_CONNECTION } from '../database/database.module';
import { workOrders, workOrderAssets, leads, contactPoints, briefingFormConfigs } from '@koria/database';
import { generateReturnUrl } from '@koria/utils';
import { ClickupService } from '../clickup/clickup.service';
import { WebhookService } from '../webhook/webhook.service';
import type {
  ValidateUploadTokenResponse,
  UploadFilesResponse,
  UploadedFileDto,
} from '@koria/types';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: PostgresJsDatabase,
    private readonly clickupService: ClickupService,
    private readonly webhookService: WebhookService,
  ) {}

  /**
   * Validate an upload token and return work order info.
   */
  async validateUploadToken(
    token: string,
  ): Promise<ValidateUploadTokenResponse | null> {
    try {
      const result = await this.db
        .select({
          id: workOrders.id,
          status: workOrders.status,
          dueAt: workOrders.dueAt,
          externalTaskId: workOrders.externalTaskId,
          leadId: workOrders.leadId,
          tenantId: workOrders.tenantId,
        })
        .from(workOrders)
        .where(eq(workOrders.uploadToken, token))
        .limit(1);

      const wo = result[0];
      if (!wo) {
        return null;
      }

      // Fetch lead name
      let leadName: string | null = null;
      if (wo.leadId) {
        const leadResult = await this.db
          .select({ displayName: leads.displayName })
          .from(leads)
          .where(eq(leads.id, wo.leadId))
          .limit(1);

        const lead = leadResult[0];
        if (lead) {
          leadName = lead.displayName;
        }
      }

      return {
        valid: true,
        workOrderId: wo.id,
        leadName,
        productName: null, // TODO: join with products when needed
        status: wo.status,
        dueAt: wo.dueAt?.toISOString() ?? null,
        externalTaskId: wo.externalTaskId,
        ...(await this.getReturnInfo(wo.leadId, wo.tenantId)),
      };
    } catch (error) {
      this.logger.error(`Error validating token: ${error}`);
      return null;
    }
  }

  /**
   * Get the lead's primary channel and compute a return URL from the tenant's form config.
   */
  private async getReturnInfo(leadId: string, tenantId: string): Promise<{ channel: string | null; returnUrl: string | null }> {
    try {
      const cpResult = await this.db
        .select({ channel: contactPoints.channel })
        .from(contactPoints)
        .where(
          and(
            eq(contactPoints.leadId, leadId),
            eq(contactPoints.isPrimary, true),
          ),
        )
        .limit(1);

      const channel = cpResult[0]?.channel ?? null;
      if (!channel) return { channel: null, returnUrl: null };

      const cfgResult = await this.db
        .select({ settings: briefingFormConfigs.settings })
        .from(briefingFormConfigs)
        .where(
          and(
            eq(briefingFormConfigs.tenantId, tenantId),
            eq(briefingFormConfigs.isActive, true),
          ),
        )
        .limit(1);

      const settings = cfgResult[0]?.settings as any;
      const returnChannels = settings?.integrations?.returnChannels;
      const returnUrl = generateReturnUrl(channel, returnChannels);
      return { channel, returnUrl };
    } catch {
      return { channel: null, returnUrl: null };
    }
  }

  /**
   * Process uploaded files:
   * 1. Validate token
   * 2. Send to ClickUp as attachments
   * 3. Save metadata in work_order_assets
   * 4. Fire N8N webhook for OCR processing
   */
  async processUploadedFiles(
    token: string,
    files: Express.Multer.File[],
  ): Promise<UploadFilesResponse> {
    // 1. Validate token and get work order data
    const workOrderData = await this.validateUploadToken(token);
    if (!workOrderData) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    const { workOrderId, externalTaskId, leadName } = workOrderData;
    const processedFiles: UploadedFileDto[] = [];
    const webhookFiles: Array<{
      fileName: string;
      mimeType: string;
      fileSize: number;
      url: string;
    }> = [];

    // 2. Process each file
    for (const file of files) {
      this.logger.log(
        `Processing: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`,
      );

      let clickupUrl: string | null = null;

      // 2a. Send to ClickUp if external_task_id exists
      if (externalTaskId) {
        const attachment = await this.clickupService.attachFileToTask(
          externalTaskId,
          file.buffer,
          file.originalname,
          file.mimetype,
        );

        if (attachment) {
          clickupUrl = attachment.url;
        }
      } else {
        this.logger.warn(
          `No external_task_id for work order ${workOrderId} — ClickUp attachment skipped`,
        );
      }

      // 2b. Save to work_order_assets
      const fileUrl = clickupUrl || `buffer://${file.originalname}`;

      const insertResult = await this.db
        .insert(workOrderAssets)
        .values({
          workOrderId,
          type: file.mimetype.split('/')[0] || 'document',
          url: fileUrl,
          metadata: {
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            clickupUrl,
          },
        })
        .returning();

      const assetRecord = insertResult[0]!;

      const uploadedFile: UploadedFileDto = {
        id: assetRecord.id,
        workOrderId,
        type: assetRecord.type,
        url: fileUrl,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        clickupAttachmentUrl: clickupUrl,
        createdAt: assetRecord.createdAt.toISOString(),
      };

      processedFiles.push(uploadedFile);

      // Collect for webhook
      webhookFiles.push({
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        url: clickupUrl || '',
      });
    }

    // 3. Fire N8N webhook (async, don't block response)
    this.webhookService
      .sendToOcrAgent({
        workOrderId,
        leadName,
        externalTaskId,
        files: webhookFiles,
        timestamp: new Date().toISOString(),
      })
      .catch((err) => {
        this.logger.error(`N8N webhook failed: ${err}`);
      });

    this.logger.log(
      `Upload complete: ${processedFiles.length} files for WO ${workOrderId}`,
    );

    return {
      success: true,
      files: processedFiles,
      message: `${processedFiles.length} arquivo(s) enviado(s) com sucesso`,
    };
  }
}
