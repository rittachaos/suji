import { Module } from '@nestjs/common';
import { BodyRecordsController } from './body-records.controller';
import { BodyRecordsService } from './body-records.service';

@Module({
  controllers: [BodyRecordsController],
  providers: [BodyRecordsService],
  exports: [BodyRecordsService],
})
export class BodyRecordsModule {}
