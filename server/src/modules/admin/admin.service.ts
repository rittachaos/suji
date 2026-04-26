import { ApplicationStatus, UserRole } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AdminListQueryDto } from './dto/admin-list-query.dto';
import { CreateStudentRelationDto } from './dto/create-student-relation.dto';
import { ReviewCoachApplicationDto } from './dto/review-coach-application.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(query: AdminListQueryDto) {
    const skip = (query.page - 1) * query.pageSize;
    const where = {
      ...(query.role ? { role: query.role as UserRole } : {}),
      ...(query.keyword
        ? {
            OR: [
              { nickname: { contains: query.keyword } },
              { phone: { contains: query.keyword } },
              { id: { contains: query.keyword } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { profile: true, goal: true },
        skip,
        take: query.pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async listCoachApplications(query: AdminListQueryDto) {
    const skip = (query.page - 1) * query.pageSize;
    const where = {
      ...(query.status ? { status: query.status as ApplicationStatus } : {}),
      ...(query.keyword
        ? {
            OR: [
              { reason: { contains: query.keyword } },
              { user: { nickname: { contains: query.keyword } } },
              { user: { phone: { contains: query.keyword } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.coachApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { user: true, reviewedBy: true },
        skip,
        take: query.pageSize,
      }),
      this.prisma.coachApplication.count({ where }),
    ]);

    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async reviewCoachApplication(adminId: string, applicationId: string, dto: ReviewCoachApplicationDto) {
    const application = await this.prisma.coachApplication.update({
      where: { id: applicationId },
      data: {
        status: dto.status,
        reviewNote: dto.reviewNote,
        reviewedById: adminId,
        reviewedAt: new Date(),
      },
      include: { user: true },
    });

    if (dto.status === ApplicationStatus.APPROVED) {
      await this.prisma.user.update({
        where: { id: application.userId },
        data: { role: UserRole.COACH },
      });
    }

    return application;
  }

  async listRelations(query: AdminListQueryDto) {
    const skip = (query.page - 1) * query.pageSize;
    const where = {
      endedAt: null,
      ...(query.keyword
        ? {
            OR: [
              { coach: { nickname: { contains: query.keyword } } },
              { student: { nickname: { contains: query.keyword } } },
              { note: { contains: query.keyword } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.coachStudentRelation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          coach: true,
          student: true,
        },
        skip,
        take: query.pageSize,
      }),
      this.prisma.coachStudentRelation.count({ where }),
    ]);

    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  createRelation(dto: CreateStudentRelationDto) {
    return this.prisma.coachStudentRelation.upsert({
      where: {
        coachId_studentId: {
          coachId: dto.coachId,
          studentId: dto.studentId,
        },
      },
      create: {
        coachId: dto.coachId,
        studentId: dto.studentId,
        note: dto.note,
      },
      update: {
        endedAt: null,
        note: dto.note,
      },
      include: { coach: true, student: true },
    });
  }
}
