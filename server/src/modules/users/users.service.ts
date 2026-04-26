import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpsertGoalDto } from './dto/upsert-goal.dto';
import { UpsertProfileDto } from './dto/upsert-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, goal: true },
    });
  }

  async upsertProfile(userId: string, dto: UpsertProfileDto) {
    const { nickname, ...profileData } = dto;

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        nickname,
        profile: {
          upsert: {
            create: profileData,
            update: profileData,
          },
        },
      },
      include: { profile: true },
    });
  }

  getGoal(userId: string) {
    return this.prisma.userGoal.findUnique({ where: { userId } });
  }

  upsertGoal(userId: string, dto: UpsertGoalDto) {
    return this.prisma.userGoal.upsert({
      where: { userId },
      create: {
        userId,
        goalType: dto.goalType,
        targetWeightKg: dto.targetWeightKg,
        targetBodyFat: dto.targetBodyFat,
        targetWaistCm: dto.targetWaistCm,
        targetStrength: dto.targetStrength,
        targetCycleDays: dto.targetCycleDays,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      update: {
        goalType: dto.goalType,
        targetWeightKg: dto.targetWeightKg,
        targetBodyFat: dto.targetBodyFat,
        targetWaistCm: dto.targetWaistCm,
        targetStrength: dto.targetStrength,
        targetCycleDays: dto.targetCycleDays,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });
  }
}
