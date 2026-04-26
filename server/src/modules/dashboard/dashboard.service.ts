import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async home(userId: string) {
    const [latestBodyRecord, latestTraining, goal] = await Promise.all([
      this.prisma.bodyRecord.findFirst({
        where: { userId },
        orderBy: { recordDate: 'desc' },
      }),
      this.prisma.trainingSession.findFirst({
        where: { userId },
        orderBy: { sessionDate: 'desc' },
        include: { exercises: true },
      }),
      this.prisma.userGoal.findUnique({ where: { userId } }),
    ]);

    return {
      latestBodyRecord,
      latestTraining,
      goal,
      todoHints: [
        !latestBodyRecord ? '建议先录入第一条身体记录' : null,
        !latestTraining ? '建议补充第一条训练记录' : null,
      ].filter(Boolean),
    };
  }

  async overview(userId: string, role: UserRole, rangeDays = 30) {
    const rangeStart = new Date();
    rangeStart.setDate(rangeStart.getDate() - rangeDays);

    const [profile, goal, bodyRecords, trainingSessions, studentCount, userCount, pendingCoachApplications] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      }),
      this.prisma.userGoal.findUnique({ where: { userId } }),
      this.prisma.bodyRecord.findMany({
        where: { userId, recordDate: { gte: rangeStart } },
        orderBy: { recordDate: 'desc' },
        take: Math.max(rangeDays, 30),
      }),
      this.prisma.trainingSession.findMany({
        where: { userId, sessionDate: { gte: rangeStart } },
        orderBy: { sessionDate: 'desc' },
        include: { exercises: { include: { sets: true } } },
        take: Math.max(rangeDays, 30),
      }),
      role === UserRole.COACH || role === UserRole.ADMIN
        ? this.prisma.coachStudentRelation.count({ where: { coachId: userId, endedAt: null } })
        : Promise.resolve(0),
      role === UserRole.ADMIN ? this.prisma.user.count() : Promise.resolve(0),
      role === UserRole.ADMIN
        ? this.prisma.coachApplication.count({ where: { status: 'PENDING' } })
        : Promise.resolve(0),
    ]);

    return {
      profile,
      goal,
      bodyRecords,
      trainingSessions,
      latestBodyRecord: bodyRecords[0] ?? null,
      latestTraining: trainingSessions[0] ?? null,
      studentCount,
      adminSummary:
        role === UserRole.ADMIN
          ? {
              userCount,
              pendingCoachApplications,
            }
          : null,
      todoHints: [
        !bodyRecords.length ? '建议先补一条身体记录' : null,
        !trainingSessions.length ? '建议先补一条训练记录' : null,
        !goal ? '建议先补充一个阶段目标' : null,
      ].filter(Boolean),
    };
  }
}
