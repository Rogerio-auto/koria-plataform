/**
 * @TenantId() decorator — extracts the tenant ID from the request.
 * For now returns the default KorIA tenant ID.
 * TODO: Implement with createParamDecorator
 */

// import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// export const TenantId = createParamDecorator(
//   (data: unknown, ctx: ExecutionContext) => {
//     const request = ctx.switchToHttp().getRequest();
//     return request.tenantId || process.env.DEFAULT_TENANT_ID;
//   },
// );

export {}; // placeholder
