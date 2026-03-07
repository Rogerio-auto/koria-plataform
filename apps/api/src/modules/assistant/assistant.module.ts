import { Module } from '@nestjs/common';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { MetricsAgent } from './agents/metrics.agent';
import { LeadsAgent } from './agents/leads.agent';
import { FollowupAgent } from './agents/followup.agent';
import { ClickupAgent } from './agents/clickup.agent';
import { ClickupModule } from '../clickup/clickup.module';

@Module({
  imports: [ClickupModule],
  controllers: [AssistantController],
  providers: [AssistantService, MetricsAgent, LeadsAgent, FollowupAgent, ClickupAgent],
})
export class AssistantModule {}
