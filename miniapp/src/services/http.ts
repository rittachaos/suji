import Taro from '@tarojs/taro';
import { storage } from '@/utils/storage';
import { BodyRecordPayload, SessionUser, TrainingSessionPayload } from '@/types/api';

const BASE_URL = process.env.TARO_APP_API_BASE || 'http://117.72.183.165:3000/api';
const MOCK_MODE = false;

type RequestOptions<T> = {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: T;
};

type MockUser = SessionUser & {
  openid?: string;
  profile?: Record<string, unknown>;
  goal?: Record<string, unknown> | null;
};

type MockCoachApplication = {
  id: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  user?: MockUser;
  reviewNote?: string;
};

type MockRelation = {
  id: string;
  coach?: MockUser;
  student?: MockUser;
  note?: string;
};

type MockStudentDetail = {
  student?: MockUser;
  bodyRecords?: BodyRecordPayload[];
  trainingSessions?: TrainingSessionPayload[];
};

const mockUsers: MockUser[] = [
  {
    id: 'mock-admin-1',
    openid: 'mock-openid-admin',
    nickname: '测试管理员',
    role: 'ADMIN',
    phone: '13800138000',
    profile: {
      gender: 'MALE',
      age: 29,
      heightCm: 178,
      trainingPhase: 'BUILDING',
      note: '当前使用 mock 数据联调完整流程。',
    },
    goal: {
      goalType: 'MUSCLE_GAIN',
      targetWeightKg: 75,
      targetBodyFat: 15,
      targetWaistCm: 80,
      targetCycleDays: 30,
      startDate: '2026-04-01',
      endDate: '2026-05-01',
    },
  },
  {
    id: 'mock-coach-1',
    nickname: '林教练',
    role: 'COACH',
    phone: '13900139000',
    profile: {
      gender: 'MALE',
      age: 31,
      heightCm: 181,
      trainingPhase: 'MAINTAINING',
      note: '擅长基础力量训练和饮食习惯管理。',
    },
    goal: {
      goalType: 'MAINTAIN',
      targetCycleDays: 60,
    },
  },
  {
    id: 'mock-user-1',
    nickname: '阿哲',
    role: 'USER',
    phone: '13700137000',
    profile: {
      gender: 'MALE',
      age: 26,
      heightCm: 175,
      trainingPhase: 'BUILDING',
      note: '卧推和深蹲进度都在稳步提升。',
    },
    goal: {
      goalType: 'MUSCLE_GAIN',
      targetWeightKg: 75,
      targetBodyFat: 15,
      targetWaistCm: 80,
      targetCycleDays: 30,
      startDate: '2026-04-01',
      endDate: '2026-05-01',
    },
  },
  {
    id: 'mock-user-2',
    nickname: '小北',
    role: 'USER',
    phone: '13600136000',
    profile: {
      gender: 'FEMALE',
      age: 24,
      heightCm: 168,
      trainingPhase: 'CUTTING',
      note: '目前重点是减脂与下肢稳定。',
    },
    goal: {
      goalType: 'FAT_LOSS',
      targetWeightKg: 55,
      targetBodyFat: 22,
      targetCycleDays: 45,
    },
  },
];

let currentMockUserId = 'mock-admin-1';

const mockRoleMap: Record<string, string> = {
  ADMIN: 'mock-admin-1',
  COACH: 'mock-coach-1',
  USER: 'mock-user-1',
};

let mockBodyRecords: Record<string, BodyRecordPayload[]> = {
  'mock-admin-1': [
    {
      recordDate: '2026-04-22',
      weightKg: 72.5,
      bodyFatRate: 18.5,
      waistCm: 85,
      chestCm: 95,
      armCm: 30,
      thighCm: 50,
      note: '早晨空腹',
    },
    {
      recordDate: '2026-04-21',
      weightKg: 72.8,
      bodyFatRate: 18.8,
      waistCm: 85.5,
      chestCm: 95.5,
      armCm: 30.2,
      thighCm: 50.2,
      note: '训练后',
    },
    {
      recordDate: '2026-04-20',
      weightKg: 73,
      bodyFatRate: 19,
      waistCm: 86,
      chestCm: 96,
      armCm: 30.5,
      thighCm: 50.5,
      note: '正常记录',
    },
  ],
  'mock-user-1': [
    { recordDate: '2026-04-22', weightKg: 68.2, bodyFatRate: 17.2, waistCm: 78, note: '状态不错' },
    { recordDate: '2026-04-19', weightKg: 68.8, bodyFatRate: 17.8, waistCm: 79, note: '周末复测' },
  ],
  'mock-user-2': [
    { recordDate: '2026-04-22', weightKg: 58.4, bodyFatRate: 24.3, waistCm: 72, note: '晨起记录' },
  ],
};

let mockTrainingSessions: Record<string, TrainingSessionPayload[]> = {
  'mock-admin-1': [
    {
      sessionDate: '2026-04-22',
      bodyPart: '胸部',
      exercises: [{ name: '平板卧推', equipment: '杠铃', bodyPart: '胸', sets: [{ setIndex: 1, weightKg: 80, reps: 8 }] }],
      note: '今天状态不错，重量提升了',
    },
    {
      sessionDate: '2026-04-20',
      bodyPart: '腿部',
      exercises: [{ name: '深蹲', equipment: '杠铃', bodyPart: '腿', sets: [{ setIndex: 1, weightKg: 100, reps: 5 }] }],
      note: '下肢训练完成度高',
    },
  ],
  'mock-user-1': [
    {
      sessionDate: '2026-04-22',
      bodyPart: '背部',
      exercises: [{ name: '硬拉', equipment: '杠铃', bodyPart: '背', sets: [{ setIndex: 1, weightKg: 120, reps: 5 }] }],
      note: '突破个人最佳',
    },
  ],
  'mock-user-2': [
    {
      sessionDate: '2026-04-21',
      bodyPart: '有氧',
      exercises: [{ name: '跑步机快走', equipment: '跑步机', bodyPart: '有氧', sets: [{ setIndex: 1, durationSeconds: 1800, distanceMeters: 3200 }] }],
      note: '配速稳定',
    },
  ],
};

let mockCoachApplications: MockCoachApplication[] = [
  {
    id: 'application-1',
    reason: '我有持续训练经验，希望帮助学员一起记录和复盘训练数据。',
    status: 'PENDING',
    user: mockUsers.find((item) => item.id === 'mock-user-1'),
  },
];

let mockRelations: MockRelation[] = [
  {
    id: 'relation-1',
    coach: mockUsers.find((item) => item.id === 'mock-coach-1'),
    student: mockUsers.find((item) => item.id === 'mock-user-1'),
    note: '增肌阶段跟进',
  },
  {
    id: 'relation-2',
    coach: mockUsers.find((item) => item.id === 'mock-coach-1'),
    student: mockUsers.find((item) => item.id === 'mock-user-2'),
    note: '减脂阶段饮食监督',
  },
];

function getCurrentMockUser() {
  return mockUsers.find((item) => item.id === currentMockUserId) || mockUsers[0];
}

function sortByDateDesc<T extends { recordDate?: string; sessionDate?: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    const left = new Date(a.recordDate || a.sessionDate || '').getTime();
    const right = new Date(b.recordDate || b.sessionDate || '').getTime();
    return right - left;
  });
}

function getPagedResult<T>(items: T[], page = 1, pageSize = 10) {
  const safePage = Number(page) || 1;
  const safePageSize = Number(pageSize) || 10;
  const start = (safePage - 1) * safePageSize;
  return {
    items: items.slice(start, start + safePageSize),
    total: items.length,
    page: safePage,
    pageSize: safePageSize,
  };
}

function getCoachStudentsList() {
  return mockRelations
    .filter((item) => item.coach?.id === 'mock-coach-1')
    .map((item) => ({
      student: item.student
        ? {
            id: item.student.id,
            nickname: item.student.nickname,
            phone: item.student.phone,
            profile: item.student.profile,
            goal: item.student.goal,
          }
        : undefined,
    }));
}

function getDashboardOverview(rangeDays = 30) {
  const user = getCurrentMockUser();
  const bodyRecords = sortByDateDesc(mockBodyRecords[user.id] || []).slice(0, Math.max(rangeDays, 6));
  const trainingSessions = sortByDateDesc(mockTrainingSessions[user.id] || []).slice(0, Math.max(rangeDays, 6));
  const studentCount = user.role === 'COACH' || user.role === 'ADMIN' ? getCoachStudentsList().length : 0;

  return {
    profile: {
      nickname: user.nickname,
      profile: {
        heightCm: user.profile?.heightCm as number | undefined,
        trainingPhase: user.profile?.trainingPhase as string | undefined,
      },
    },
    goal: user.goal,
    bodyRecords,
    trainingSessions,
    latestBodyRecord: bodyRecords[0] || null,
    latestTraining: trainingSessions[0] || null,
    studentCount,
    adminSummary: user.role === 'ADMIN'
      ? {
          userCount: mockUsers.length,
          pendingCoachApplications: mockCoachApplications.filter((item) => item.status === 'PENDING').length,
        }
      : null,
  };
}

function filterUsers(keyword = '', role = '') {
  return mockUsers.filter((item) => {
    const matchedKeyword = !keyword || [item.id, item.nickname, item.phone].filter(Boolean).some((field) => String(field).includes(keyword));
    const matchedRole = !role || item.role === role;
    return matchedKeyword && matchedRole;
  });
}

function getMockData<TData>(url: string, method?: string, data?: TData) {
  const [pathname, queryString = ''] = url.split('?');
  const params = new URLSearchParams(queryString);
  const activeUser = getCurrentMockUser();

  if (pathname === '/auth/wechat/login' && method === 'POST') {
    const selectedRole = storage.getMockRole() || 'ADMIN';
    currentMockUserId = mockRoleMap[selectedRole] || 'mock-admin-1';
    const user = getCurrentMockUser();
    return {
      token: 'mock-token-123456',
      user,
    };
  }

  if (pathname === '/auth/me') {
    return activeUser;
  }

  if (pathname === '/auth/bind-phone' && method === 'POST') {
    activeUser.phone = (data as { phone?: string } | undefined)?.phone || activeUser.phone;
    return activeUser;
  }

  if (pathname === '/dashboard/overview' && (method ?? 'GET') === 'GET') {
    return getDashboardOverview(Number(params.get('rangeDays') || 30));
  }

  if (pathname === '/body-records' && (method ?? 'GET') === 'GET') {
    const items = sortByDateDesc(mockBodyRecords[activeUser.id] || []);
    return getPagedResult(items, Number(params.get('page') || 1), Number(params.get('pageSize') || 20));
  }

  if (pathname === '/body-records' && method === 'POST') {
    const payload = data as BodyRecordPayload;
    const next = sortByDateDesc([payload, ...(mockBodyRecords[activeUser.id] || [])]);
    mockBodyRecords[activeUser.id] = next;
    return payload;
  }

  if (pathname === '/training/sessions' && (method ?? 'GET') === 'GET') {
    const items = sortByDateDesc(mockTrainingSessions[activeUser.id] || []);
    return getPagedResult(items, Number(params.get('page') || 1), Number(params.get('pageSize') || 20));
  }

  if (pathname === '/training/sessions' && method === 'POST') {
    const payload = data as TrainingSessionPayload;
    const next = sortByDateDesc([payload, ...(mockTrainingSessions[activeUser.id] || [])]);
    mockTrainingSessions[activeUser.id] = next;
    return payload;
  }

  if (pathname === '/users/profile' && (method ?? 'GET') === 'GET') {
    return {
      ...activeUser,
      profile: activeUser.profile || {},
    };
  }

  if (pathname === '/users/profile' && method === 'PUT') {
    const payload = (data as Record<string, unknown>) || {};
    activeUser.nickname = (payload.nickname as string) || activeUser.nickname;
    activeUser.profile = {
      ...(activeUser.profile || {}),
      gender: payload.gender,
      age: payload.age,
      heightCm: payload.heightCm,
      trainingPhase: payload.trainingPhase,
      note: payload.note,
    };
    return {
      ...activeUser,
      profile: activeUser.profile,
    };
  }

  if (pathname === '/users/goal' && (method ?? 'GET') === 'GET') {
    return activeUser.goal || null;
  }

  if (pathname === '/users/goal' && method === 'PUT') {
    activeUser.goal = { ...((data as Record<string, unknown>) || {}) };
    return activeUser.goal;
  }

  if (pathname === '/coaches/applications' && method === 'POST') {
    const application = {
      id: `application-${Date.now()}`,
      reason: (data as { reason?: string } | undefined)?.reason || '',
      status: 'PENDING' as const,
      user: activeUser,
    };
    mockCoachApplications = [application, ...mockCoachApplications];
    return application;
  }

  if (pathname === '/coaches/students' && (method ?? 'GET') === 'GET') {
    const keyword = params.get('keyword') || '';
    const page = Number(params.get('page') || 1);
    const pageSize = Number(params.get('pageSize') || 20);
    const students = getCoachStudentsList().filter((item) => {
      const student = item.student;
      return !keyword || [student?.id, student?.nickname, student?.phone].filter(Boolean).some((field) => String(field).includes(keyword));
    });
    return getPagedResult(students, page, pageSize);
  }

  if (/^\/coaches\/students\/[^/]+\/detail$/.test(pathname) && (method ?? 'GET') === 'GET') {
    const studentId = pathname.split('/')[3];
    const student = mockUsers.find((item) => item.id === studentId);
    const result: MockStudentDetail = {
      student,
      bodyRecords: sortByDateDesc(mockBodyRecords[studentId] || []),
      trainingSessions: sortByDateDesc(mockTrainingSessions[studentId] || []),
    };
    return result;
  }

  if (/^\/coaches\/students\/[^/]+\/body-records$/.test(pathname) && method === 'POST') {
    const studentId = pathname.split('/')[3];
    const payload = data as BodyRecordPayload;
    mockBodyRecords[studentId] = sortByDateDesc([payload, ...(mockBodyRecords[studentId] || [])]);
    return payload;
  }

  if (/^\/coaches\/students\/[^/]+\/training-sessions$/.test(pathname) && method === 'POST') {
    const studentId = pathname.split('/')[3];
    const payload = data as TrainingSessionPayload;
    mockTrainingSessions[studentId] = sortByDateDesc([payload, ...(mockTrainingSessions[studentId] || [])]);
    return payload;
  }

  if (pathname === '/admin/users' && (method ?? 'GET') === 'GET') {
    return getPagedResult(filterUsers(params.get('keyword') || '', params.get('role') || ''), Number(params.get('page') || 1), Number(params.get('pageSize') || 10));
  }

  if (pathname === '/admin/coach-applications' && (method ?? 'GET') === 'GET') {
    const keyword = params.get('keyword') || '';
    const status = params.get('status') || '';
    const items = mockCoachApplications.filter((item) => {
      const matchedKeyword = !keyword || [item.reason, item.user?.nickname, item.user?.id].filter(Boolean).some((field) => String(field).includes(keyword));
      const matchedStatus = !status || item.status === status;
      return matchedKeyword && matchedStatus;
    });
    return getPagedResult(items, Number(params.get('page') || 1), Number(params.get('pageSize') || 10));
  }

  if (/^\/admin\/coach-applications\/[^/]+\/review$/.test(pathname) && method === 'PATCH') {
    const applicationId = pathname.split('/')[3];
    const payload = (data as { status?: 'APPROVED' | 'REJECTED'; reviewNote?: string }) || {};
    mockCoachApplications = mockCoachApplications.map((item) => item.id === applicationId ? { ...item, status: payload.status || item.status, reviewNote: payload.reviewNote } : item);
    return { success: true };
  }

  if (pathname === '/admin/relations' && (method ?? 'GET') === 'GET') {
    const keyword = params.get('keyword') || '';
    const items = mockRelations.filter((item) => !keyword || [item.note, item.coach?.nickname, item.student?.nickname, item.coach?.id, item.student?.id].filter(Boolean).some((field) => String(field).includes(keyword)));
    return getPagedResult(items, Number(params.get('page') || 1), Number(params.get('pageSize') || 10));
  }

  if (pathname === '/admin/relations' && method === 'POST') {
    const payload = (data as { coachId?: string; studentId?: string; note?: string }) || {};
    const relation = {
      id: `relation-${Date.now()}`,
      coach: mockUsers.find((item) => item.id === payload.coachId),
      student: mockUsers.find((item) => item.id === payload.studentId),
      note: payload.note,
    };
    mockRelations = [relation, ...mockRelations];
    return relation;
  }

  return {};
}

export async function request<TData = unknown, TResult = unknown>(options: RequestOptions<TData>) {
  if (MOCK_MODE) {
    return getMockData(options.url, options.method, options.data) as TResult;
  }

  const token = storage.getToken();

  const response = await Taro.request<TResult>({
    url: `${BASE_URL}${options.url}`,
    method: options.method ?? 'GET',
    data: options.data,
    header: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });

  if (response.statusCode === 401) {
    storage.clearToken();
    Taro.showToast({ title: '登录已失效，请重新登录', icon: 'none' });
    throw new Error('Unauthorized');
  }

  if (response.statusCode >= 400) {
    throw new Error(`Request failed with status ${response.statusCode}`);
  }

  return response.data;
}
