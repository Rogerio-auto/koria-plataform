import { Module } from '@nestjs/common';
import { ObjectionsController } from './objections.controller';
import { ObjectionsService } from './objections.service';

@Module({
  controllers: [ObjectionsController],
  providers: [ObjectionsService],
  exports: [ObjectionsService],
})
export class ObjectionsModule {}
