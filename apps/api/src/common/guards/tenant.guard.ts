/**
 * Tenant guard — ensures all requests include a valid tenant context.
 */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    request.tenantId = request.user?.tenantId || process.env.DEFAULT_TENANT_ID;
    return !!request.tenantId;
  }
}
