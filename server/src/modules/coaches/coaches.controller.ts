import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateBodyRecordDto } from '../body-records/dto/create-body-record.dto';
import { CreateTrainingSessionDto } from '../training/dto/create-training-session.dto';
import { CoachesService } from './coaches.service';
import { CreateCoachApplicationDto } from './dto/create-coach-application.dto';

@Controller('coaches')
export class CoachesController {
  constructor(private readonly coachesService: CoachesService) {}

  @Post('applications')
  createApplication(@CurrentUser() user: { id: string }, @Body() dto: CreateCoachApplicationDto) {
    return this.coachesService.createApplication(user.id, dto);
  }

  @Get('applications/current')
  currentApplication(@CurrentUser() user: { id: string }) {
    return this.coachesService.currentApplication(user.id);
  }

  @Get('students')
  @Roles('COACH', 'ADMIN')
  students(
    @CurrentUser() user: { id: string },
    @Query() query: PaginationQueryDto,
    @Query('keyword') keyword?: string,
  ) {
    return this.coachesService.students(user.id, { ...query, keyword });
  }

  @Get('students/:studentId/detail')
  @Roles('COACH', 'ADMIN')
  studentDetail(@CurrentUser() user: { id: string }, @Param('studentId') studentId: string) {
    return this.coachesService.studentDetail(user.id, studentId);
  }

  @Post('students/:studentId/body-records')
  @Roles('COACH', 'ADMIN')
  createStudentBodyRecord(
    @CurrentUser() user: { id: string },
    @Param('studentId') studentId: string,
    @Body() dto: CreateBodyRecordDto,
  ) {
    return this.coachesService.createStudentBodyRecord(user.id, studentId, dto);
  }

  @Post('students/:studentId/training-sessions')
  @Roles('COACH', 'ADMIN')
  createStudentTraining(
    @CurrentUser() user: { id: string },
    @Param('studentId') studentId: string,
    @Body() dto: CreateTrainingSessionDto,
  ) {
    return this.coachesService.createStudentTraining(user.id, studentId, dto);
  }
}
