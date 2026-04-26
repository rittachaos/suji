import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateTrainingSessionDto, ExerciseSetDto, TrainingExerciseDto } from './dto/create-training-session.dto';

@Injectable()
export class TrainingService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeExerciseSets(exercise: TrainingExerciseDto): ExerciseSetDto[] {
    if (exercise.sets?.length) {
      return exercise.sets;
    }

    if (exercise.exerciseType === 'CARDIO' || exercise.bodyPart === '有氧') {
      return [
        {
          setIndex: 1,
          durationSeconds: (exercise.durationMinutes ?? 0) * 60,
        },
      ];
    }

    const setCount = Math.max(1, exercise.setCount ?? 1);
    return Array.from({ length: setCount }, (_, index) => ({
      setIndex: index + 1,
      weightKg: index === 0 ? exercise.topWeightKg ?? exercise.workingWeightKg : exercise.workingWeightKg,
      reps: 8,
      rpe: 8,
    }));
  }

  private summarizeSets(sets: ExerciseSetDto[]) {
    const totalVolume = sets.reduce((sum, item) => sum + (item.weightKg ?? 0) * (item.reps ?? 0), 0);
    const bestWeightKg = sets.reduce((max, item) => Math.max(max, item.weightKg ?? 0), 0);
    const bestSet = sets.find((item) => (item.weightKg ?? 0) === bestWeightKg);
    const estimatedOneRm =
      bestSet && bestSet.weightKg && bestSet.reps
        ? Number((bestSet.weightKg * (1 + bestSet.reps / 30)).toFixed(2))
        : 0;

    return { totalVolume, bestWeightKg, estimatedOneRm };
  }

  private summarizeExercises(exercises: TrainingExerciseDto[]) {
    return exercises.map((exercise) => {
      const sets = this.normalizeExerciseSets(exercise);
      const summary = this.summarizeSets(sets);
      return {
        ...exercise,
        sets,
        ...summary,
      };
    });
  }

  async list(userId: string, query: PaginationQueryDto) {
    const skip = (query.page - 1) * query.pageSize;

    const [items, total] = await Promise.all([
      this.prisma.trainingSession.findMany({
        where: { userId },
        orderBy: { sessionDate: 'desc' },
        include: { exercises: { include: { sets: true } } },
        skip,
        take: query.pageSize,
      }),
      this.prisma.trainingSession.count({ where: { userId } }),
    ]);

    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async create(userId: string, dto: CreateTrainingSessionDto) {
    const exercisePayload = this.summarizeExercises(dto.exercises);
    const totalVolume = exercisePayload.reduce((sum, item) => sum + item.totalVolume, 0);
    const estimatedOneRm = Math.max(...exercisePayload.map((item) => item.estimatedOneRm), 0);

    return this.prisma.trainingSession.create({
      data: {
        userId,
        sessionDate: new Date(dto.sessionDate),
        bodyPart: dto.bodyPart,
        note: dto.note,
        totalVolume,
        estimatedOneRm,
        exercises: {
          create: exercisePayload.map((exercise) => ({
            name: exercise.name,
            equipment: exercise.equipment,
            bodyPart: exercise.bodyPart,
            bestWeightKg: exercise.bestWeightKg,
            totalVolume: exercise.totalVolume,
            estimatedOneRm: exercise.estimatedOneRm,
            sets: {
              create: exercise.sets.map((set) => ({
                setIndex: set.setIndex,
                weightKg: set.weightKg,
                reps: set.reps,
                rpe: set.rpe,
                durationSeconds: set.durationSeconds,
                distanceMeters: set.distanceMeters,
                note: set.note,
              })),
            },
          })),
        },
      },
      include: { exercises: { include: { sets: true } } },
    });
  }

  detail(userId: string, id: string) {
    return this.prisma.trainingSession.findFirst({
      where: { id, userId },
      include: { exercises: { include: { sets: true } } },
    });
  }

  async update(userId: string, id: string, dto: CreateTrainingSessionDto) {
    await this.prisma.trainingSession.findFirstOrThrow({ where: { id, userId } });

    await this.prisma.exerciseSet.deleteMany({ where: { exercise: { sessionId: id } } });
    await this.prisma.trainingExercise.deleteMany({ where: { sessionId: id } });

    const exercisePayload = this.summarizeExercises(dto.exercises);
    const totalVolume = exercisePayload.reduce((sum, item) => sum + item.totalVolume, 0);
    const estimatedOneRm = Math.max(...exercisePayload.map((item) => item.estimatedOneRm), 0);

    return this.prisma.trainingSession.update({
      where: { id },
      data: {
        sessionDate: new Date(dto.sessionDate),
        bodyPart: dto.bodyPart,
        note: dto.note,
        totalVolume,
        estimatedOneRm,
        exercises: {
          create: exercisePayload.map((exercise) => ({
            name: exercise.name,
            equipment: exercise.equipment,
            bodyPart: exercise.bodyPart,
            bestWeightKg: exercise.bestWeightKg,
            totalVolume: exercise.totalVolume,
            estimatedOneRm: exercise.estimatedOneRm,
            sets: {
              create: exercise.sets.map((set) => ({
                setIndex: set.setIndex,
                weightKg: set.weightKg,
                reps: set.reps,
                rpe: set.rpe,
                durationSeconds: set.durationSeconds,
                distanceMeters: set.distanceMeters,
                note: set.note,
              })),
            },
          })),
        },
      },
      include: { exercises: { include: { sets: true } } },
    });
  }

  async remove(userId: string, id: string) {
    await this.prisma.trainingSession.findFirstOrThrow({ where: { id, userId } });

    return this.prisma.trainingSession.delete({ where: { id } });
  }
}
