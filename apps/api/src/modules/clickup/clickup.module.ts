import { Module, Global } from '@nestjs/common';
import { ClickupController } from './clickup.controller';
import { ClickupService } from './clickup.service';

@Global()
@Module({
  controllers: [ClickupController],
  providers: [ClickupService],
  exports: [ClickupService],
})
export class ClickupModule {}
