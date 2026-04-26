import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateBodyRecordDto } from './dto/create-body-record.dto';

@Injectable()
export class BodyRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  private calcBmi(heightCm?: number, weightKg?: number) {
    if (!heightCm || !weightKg) {
      return undefined;
    }

    const heightM = heightCm / 100;
    return Number((weightKg / (heightM * heightM)).toFixed(2));
  }

  async list(userId: string, query: PaginationQueryDto) {
    const skip = (query.page - 1) * query.pageSize;

    const [items, total] = await Promise.all([
      this.prisma.bodyRecord.findMany({
        where: { userId },
        orderBy: { recordDate: 'desc' },
        skip,
        take: query.pageSize,
      }),
      this.prisma.bodyRecord.count({ where: { userId } }),
    ]);

    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  create(userId: string, dto: CreateBodyRecordDto) {
    return this.prisma.bodyRecord.create({
      data: {
        userId,
        recordDate: new Date(dto.recordDate),
        heightCm: dto.heightCm,
        weightKg: dto.weightKg,
        bodyFatRate: dto.bodyFatRate,
        skeletalMuscle: dto.skeletalMuscle,
        bmi: this.calcBmi(dto.heightCm, dto.weightKg),
        chestCm: dto.chestCm,
        waistCm: dto.waistCm,
        hipCm: dto.hipCm,
        armCm: dto.armCm,
        thighCm: dto.thighCm,
        calfCm: dto.calfCm,
        shoulderCm: dto.shoulderCm,
        extraMetrics: dto.extraMetrics,
        note: dto.note,
      },
    });
  }

  detail(userId: string, id: string) {
    return this.prisma.bodyRecord.findFirst({
      where: { id, userId },
      include: { reports: true },
    });
  }

  async update(userId: string, id: string, dto: CreateBodyRecordDto) {
    await this.prisma.bodyRecord.findFirstOrThrow({ where: { id, userId } });

    return this.prisma.bodyRecord.update({
      where: { id },
      data: {
        recordDate: new Date(dto.recordDate),
        heightCm: dto.heightCm,
        weightKg: dto.weightKg,
        bodyFatRate: dto.bodyFatRate,
        skeletalMuscle: dto.skeletalMuscle,
        bmi: this.calcBmi(dto.heightCm, dto.weightKg),
        chestCm: dto.chestCm,
        waistCm: dto.waistCm,
        hipCm: dto.hipCm,
        armCm: dto.armCm,
        thighCm: dto.thighCm,
        calfCm: dto.calfCm,
        shoulderCm: dto.shoulderCm,
        extraMetrics: dto.extraMetrics,
        note: dto.note,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.prisma.bodyRecord.findFirstOrThrow({ where: { id, userId } });

    return this.prisma.bodyRecord.delete({ where: { id } });
  }
}
