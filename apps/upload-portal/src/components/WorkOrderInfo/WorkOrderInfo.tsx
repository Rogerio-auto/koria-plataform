import { Briefcase, Calendar, User } from 'lucide-react';
import type { WorkOrderInfo as WorkOrderData } from '@/services/api';

interface WorkOrderInfoProps {
  workOrder: WorkOrderData;
}

export function WorkOrderInfo({ workOrder }: WorkOrderInfoProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Detalhes do Projeto
      </h3>

      <div className="space-y-3">
        {workOrder.leadName && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cliente</p>
              <p className="text-sm font-medium text-foreground">{workOrder.leadName}</p>
            </div>
          </div>
        )}

        {workOrder.productName && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Briefcase className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Produto</p>
              <p className="text-sm font-medium text-foreground">{workOrder.productName}</p>
            </div>
          </div>
        )}

        {workOrder.dueAt && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Prazo</p>
              <p className="text-sm font-medium text-foreground">
                {new Date(workOrder.dueAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
