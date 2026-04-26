import { ApplicationStatus, GoalType, TrainingPhase, UserRole } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { openId: 'seed-admin-openid' },
    update: {
      nickname: '运营管理员',
      role: UserRole.ADMIN,
      phone: '13800000000',
    },
    create: {
      openId: 'seed-admin-openid',
      nickname: '运营管理员',
      phone: '13800000000',
      role: UserRole.ADMIN,
      profile: {
        create: {
          heightCm: 175,
          trainingPhase: TrainingPhase.MAINTAINING,
          note: '用于管理台和审批流联调',
        },
      },
    },
  });

  const coach = await prisma.user.upsert({
    where: { openId: 'seed-coach-openid' },
    update: {
      nickname: '种子教练',
      role: UserRole.COACH,
      phone: '13900000000',
    },
    create: {
      openId: 'seed-coach-openid',
      nickname: '种子教练',
      phone: '13900000000',
      role: UserRole.COACH,
      profile: {
        create: {
          heightCm: 178,
          trainingPhase: TrainingPhase.BUILDING,
          note: '用于教练端联调',
        },
      },
      goal: {
        create: {
          goalType: GoalType.STRENGTH,
          targetWeightKg: 80,
          targetCycleDays: 90,
        },
      },
    },
  });

  const student = await prisma.user.upsert({
    where: { openId: 'seed-student-openid' },
    update: {
      nickname: '种子学员',
      role: UserRole.USER,
      phone: '13700000000',
    },
    create: {
      openId: 'seed-student-openid',
      nickname: '种子学员',
      phone: '13700000000',
      role: UserRole.USER,
      profile: {
        create: {
          heightCm: 172,
          trainingPhase: TrainingPhase.CUTTING,
          note: '用于用户和日历页联调',
        },
      },
      goal: {
        create: {
          goalType: GoalType.FAT_LOSS,
          targetWeightKg: 68,
          targetBodyFat: 15,
          targetCycleDays: 60,
        },
      },
    },
  });

  await prisma.coachStudentRelation.upsert({
    where: {
      coachId_studentId: {
        coachId: coach.id,
        studentId: student.id,
      },
    },
    update: {
      endedAt: null,
      note: '初始化种子关系',
    },
    create: {
      coachId: coach.id,
      studentId: student.id,
      note: '初始化种子关系',
    },
  });

  const application = await prisma.coachApplication.findFirst({
    where: { userId: student.id },
  });

  if (!application) {
    await prisma.coachApplication.create({
      data: {
        userId: student.id,
        reason: '我有持续训练和带练经验，希望成为教练用于审批流演示。',
        status: ApplicationStatus.PENDING,
      },
    });
  }

  const existingBodyRecord = await prisma.bodyRecord.findFirst({ where: { userId: student.id } });
  if (!existingBodyRecord) {
    await prisma.bodyRecord.createMany({
      data: [
        {
          userId: student.id,
          recordDate: new Date('2026-04-10'),
          heightCm: 172,
          weightKg: 74.5,
          bodyFatRate: 21.8,
          waistCm: 84,
          bmi: 25.18,
          note: '起始记录',
        },
        {
          userId: student.id,
          recordDate: new Date('2026-04-18'),
          heightCm: 172,
          weightKg: 73.2,
          bodyFatRate: 20.6,
          waistCm: 82,
          bmi: 24.74,
          note: '第二阶段记录',
        },
      ],
    });
  }

  const existingTraining = await prisma.trainingSession.findFirst({ where: { userId: student.id } });
  if (!existingTraining) {
    await prisma.trainingSession.create({
      data: {
        userId: student.id,
        sessionDate: new Date('2026-04-18'),
        bodyPart: '胸',
        note: '种子训练记录',
        totalVolume: 1560,
        estimatedOneRm: 76,
        exercises: {
          create: [
            {
              name: '卧推',
              equipment: '杠铃',
              bodyPart: '胸',
              bestWeightKg: 60,
              totalVolume: 1560,
              estimatedOneRm: 76,
              sets: {
                create: [
                  { setIndex: 1, weightKg: 60, reps: 8 },
                  { setIndex: 2, weightKg: 60, reps: 8 },
                  { setIndex: 3, weightKg: 55, reps: 10 },
                ],
              },
            },
          ],
        },
      },
    });
  }

  console.log('Seed completed', {
    adminId: admin.id,
    coachId: coach.id,
    studentId: student.id,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
