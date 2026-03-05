import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { BriefingController } from './briefing.controller';
import { BriefingService } from './briefing.service';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max for logo
        files: 1,
      },
    }),
  ],
  controllers: [BriefingController],
  providers: [BriefingService],
})
export class BriefingModule {}
