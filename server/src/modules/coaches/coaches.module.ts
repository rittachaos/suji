import { Module } from '@nestjs/common';
import { BodyRecordsModule } from '../body-records/body-records.module';
import { TrainingModule } from '../training/training.module';
import { CoachesController } from './coaches.controller';
import { CoachesService } from './coaches.service';

@Module({
  imports: [BodyRecordsModule, TrainingModule],
  controllers: [CoachesController],
  providers: [CoachesService],
  exports: [CoachesService],
})
export class CoachesModule {}
