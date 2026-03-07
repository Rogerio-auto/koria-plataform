/**
 * @TenantId() decorator — extracts the tenant ID from the request.
 * Falls back to DEFAULT_TENANT_ID env var.
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.tenantId || process.env.DEFAULT_TENANT_ID;
  },
);
