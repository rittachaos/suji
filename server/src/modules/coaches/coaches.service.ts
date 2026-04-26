import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateBodyRecordDto } from '../body-records/dto/create-body-record.dto';
import { BodyRecordsService } from '../body-records/body-records.service';
import { CreateCoachApplicationDto } from './dto/create-coach-application.dto';
import { CreateTrainingSessionDto } from '../training/dto/create-training-session.dto';
import { TrainingService } from '../training/training.service';

@Injectable()
export class CoachesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bodyRecordsService: BodyRecordsService,
    private readonly trainingService: TrainingService,
  ) {}

  createApplication(userId: string, dto: CreateCoachApplicationDto) {
    return this.prisma.coachApplication.create({
      data: {
        userId,
        reason: dto.reason,
      },
    });
  }

  currentApplication(userId: string) {
    return this.prisma.coachApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async students(coachId: string, query: PaginationQueryDto & { keyword?: string }) {
    const skip = (query.page - 1) * query.pageSize;
    const where = {
      coachId,
      endedAt: null,
      ...(query.keyword
        ? {
            OR: [
              { student: { nickname: { contains: query.keyword } } },
              { student: { phone: { contains: query.keyword } } },
              { studentId: { contains: query.keyword } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.coachStudentRelation.findMany({
        where,
        include: { student: { include: { profile: true, goal: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.pageSize,
      }),
      this.prisma.coachStudentRelation.count({ where }),
    ]);

    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async studentDetail(coachId: string, studentId: string) {
    await this.prisma.coachStudentRelation.findFirstOrThrow({
      where: { coachId, studentId, endedAt: null },
    });

    const [student, bodyRecords, trainingSessions] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: studentId },
        include: { profile: true, goal: true },
      }),
      this.prisma.bodyRecord.findMany({
        where: { userId: studentId },
        orderBy: { recordDate: 'desc' },
        take: 5,
      }),
      this.prisma.trainingSession.findMany({
        where: { userId: studentId },
        orderBy: { sessionDate: 'desc' },
        include: { exercises: { include: { sets: true } } },
        take: 5,
      }),
    ]);

    return { student, bodyRecords, trainingSessions };
  }

  createStudentBodyRecord(_coachId: string, studentId: string, dto: CreateBodyRecordDto) {
    return this.bodyRecordsService.create(studentId, dto);
  }

  createStudentTraining(_coachId: string, studentId: string, dto: CreateTrainingSessionDto) {
    return this.trainingService.create(studentId, dto);
  }
}
