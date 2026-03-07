/** core.pipelines */
export interface Pipeline {
  id: string;
  tenantId: string;
  name: string;
  createdAt: string;
}

/** core.stages */
export interface Stage {
  id: string;
  pipelineId: string;
  name: string;
  code: string;
  position: number;
  isTerminal: boolean;
}

/** Pipeline with stages (joined) */
export interface PipelineWithStages extends Pipeline {
  stages: Stage[];
}
