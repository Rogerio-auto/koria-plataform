import { Module } from '@nestjs/common';
import { BriefingFormConfigController } from './briefing-form-config.controller';
import { BriefingFormConfigService } from './briefing-form-config.service';

@Module({
  controllers: [BriefingFormConfigController],
  providers: [BriefingFormConfigService],
  exports: [BriefingFormConfigService],
})
export class SettingsModule {}
