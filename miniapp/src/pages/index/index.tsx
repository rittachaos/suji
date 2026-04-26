import Taro from '@tarojs/taro';
import { Button, ScrollView, Text, View } from '@tarojs/components';
import { useEffect, useMemo, useState } from 'react';
import { fetchCoachStudents } from '@/services/modules/coaches';
import { fetchDashboardOverview } from '@/services/modules/dashboard';
import { useUserStore } from '@/store/user';
import { BodyRecordPayload, TrainingSessionPayload } from '@/types/api';
import { tabBarIconMap } from '@/utils/tabbar';
import {
  createEnterStyle,
  createGlassCardStyle,
  createPageContentStyle,
  createPressableCardStyle,
  createPrimaryButtonStyle,
  createSecondaryButtonStyle,
  helperTextStyle,
  metricValueLargeStyle,
  metricValueXLStyle,
  pageHeroSubtitleStyle,
  pageHeroTitleStyle,
  sectionTitleStyle,
  tokens,
} from '@/utils/design';

type GoalData = {
  goalType?: string;
  targetWeightKg?: number;
  targetBodyFat?: number;
  targetWaistCm?: number;
  targetCycleDays?: number;
};

type ProfileData = {
  nickname?: string;
  profile?: {
    heightCm?: number;
    trainingPhase?: string;
  };
  goal?: GoalData | null;
};

type DashboardOverview = {
  profile?: ProfileData;
  goal?: GoalData | null;
  bodyRecords?: BodyRecordPayload[];
  trainingSessions?: TrainingSessionPayload[];
  latestBodyRecord?: BodyRecordPayload | null;
  latestTraining?: TrainingSessionPayload | null;
  studentCount?: number;
  adminSummary?: {
    userCount: number;
    pendingCoachApplications: number;
  } | null;
  todoHints?: string[];
};

const personalWelcomeLines = {
  morning: [
    '把今天的开始过漂亮，后面的每一步都会更从容。',
    '清晨最适合种下节奏，晚些时候你会感谢现在的认真。',
    '早一点为自己投入，今天就会多一分掌控感。',
  ],
  daytime: [
    '今天的每一次认真记录，都会在未来替你发光。',
    '真正动人的变化，往往从一次不敷衍的记录开始。',
    '别急着追结果，先把今天过得足够扎实。',
  ],
  evening: [
    '把今天的状态留住，明天的你会更清楚自己走了多远。',
    '夜晚适合回望，也适合为下一次进步留下证据。',
    '一天快结束时，最值得的是仍然没有放弃照顾自己。',
  ],
};

const coachWelcomeLines = {
  morning: [
    '先稳住自己的节奏，今天带人时你会更有力量。',
    '清晨的清晰判断，会让今天的陪伴更有方向。',
    '教练的一天，从先照顾好自己的状态开始。',
  ],
  daytime: [
    '你记录的不只是训练，更是在陪每一位学员看见成长。',
    '你给出的每一次反馈，都可能成为别人坚持下去的理由。',
    '教练的价值，不只在计划里，更在每次细致的关注里。',
  ],
  evening: [
    '一天结束时回看细节，你会发现真正的影响力藏在耐心里。',
    '今晚的复盘，会让明天的指导更稳、更准。',
    '教练的专业，常常体现在别人看不见的那部分认真。',
  ],
};

const adminWelcomeLines = {
  morning: [
    '从容地开启今天，整个平台都会因为你的判断更顺畅。',
    '早一点看清重点，今天的节奏就会更优雅。',
    '清晨的决策清晰度，往往决定一天的运行质感。',
  ],
  daytime: [
    '你看到的不只是数据，更是平台每一步成长的轮廓。',
    '当细节被认真对待，整体体验自然会被拉高。',
    '好的管理不是喧哗，而是让一切有条不紊地发生。',
  ],
  evening: [
    '夜晚适合沉淀判断，今天的每一个决定都在塑造明天。',
    '当一天渐渐安静下来，真正重要的优先级会更清晰。',
    '收束好今天的细节，系统明天就会更从容地运转。',
  ],
};

const pageStyle = {
  minHeight: '100vh',
  background: tokens.pageBackground,
};

const pageContentStyle = createPageContentStyle();

const cardStyle = {
  ...createGlassCardStyle(),
  borderRadius: '32px',
};

const accentButtonStyle = createPrimaryButtonStyle();

const secondaryButtonStyle = createSecondaryButtonStyle();

function formatGoalType(goalType?: string) {
  const map: Record<string, string> = {
    FAT_LOSS: '减脂',
    MUSCLE_GAIN: '增肌',
    SHAPING: '塑形',
    STRENGTH: '力量提升',
    MAINTAIN: '维持',
  };

  return goalType ? map[goalType] || goalType : '未设定';
}

const sectionEyebrowStyle = {
  display: 'block',
  fontSize: '15px',
  lineHeight: '1',
  letterSpacing: '0.2em',
  color: '#91A0B5',
  textTransform: 'uppercase',
};

const sectionHeadingStyle = {
  display: 'block',
  marginTop: '6px',
  fontSize: '26px',
  lineHeight: '1.06',
  fontWeight: '700',
  color: '#1C2738',
  letterSpacing: '-0.04em',
};

const sectionMetaWrapStyle = {
  paddingBottom: '3px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

const sectionMetaLineStyle = {
  width: '22px',
  height: '1px',
  background: 'rgba(145, 160, 181, 0.34)',
};

const sectionMetaTextStyle = {
  fontSize: '13px',
  color: '#91A0B5',
  letterSpacing: '0.1em',
};

const lightPanelShadow = '0 8px 18px rgba(125, 142, 168, 0.06), inset 0 1px 0 rgba(255,255,255,0.92)';
const softPanelShadow = '0 8px 18px rgba(141, 126, 196, 0.05), inset 0 1px 0 rgba(255,255,255,0.92)';
const darkPanelShadow = '0 10px 20px rgba(19,32,51,0.14)';
const interactiveTransition = 'transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 220ms ease, box-shadow 240ms ease';

export default function IndexPage() {
  const { user, login, bootstrap } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [entered, setEntered] = useState(false);
  const [heroTickerIndex, setHeroTickerIndex] = useState(0);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [goal, setGoal] = useState<GoalData | null>(null);
  const [bodyRecords, setBodyRecords] = useState<BodyRecordPayload[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<TrainingSessionPayload[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [adminSummary, setAdminSummary] = useState<DashboardOverview['adminSummary']>(null);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 40);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadDashboard = async () => {
      setLoading(true);
      try {
        const requests = [fetchDashboardOverview(30)];
        if (user.role === 'COACH' || user.role === 'ADMIN') {
          requests.push(fetchCoachStudents() as never);
        }

        const results = await Promise.all(requests);
        const [dashboardRes, studentsRes] = results as [
          DashboardOverview,
          unknown[] | undefined,
        ];

        setProfile(dashboardRes?.profile || null);
        setGoal(dashboardRes?.goal || null);
        setBodyRecords(dashboardRes?.bodyRecords || []);
        setTrainingRecords(dashboardRes?.trainingSessions || []);
        setStudentCount(Array.isArray(studentsRes) ? studentsRes.length : dashboardRes?.studentCount || 0);
        setAdminSummary(dashboardRes?.adminSummary || null);
      } catch {
        Taro.showToast({ title: '首页数据加载失败', icon: 'none' });
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, [user]);

  const latestBody = bodyRecords[0];
  const latestTraining = trainingRecords[0];
  const currentHour = new Date().getHours();
  const dayPeriod = currentHour < 11 ? 'morning' : currentHour < 18 ? 'daytime' : 'evening';
  const heroGreeting = dayPeriod === 'morning' ? 'GOOD MORNING' : dayPeriod === 'evening' ? 'GOOD EVENING' : 'WELCOME BACK';
  const heroBadge = dayPeriod === 'morning' ? 'MORNING' : dayPeriod === 'evening' ? 'EVENING' : 'TODAY';

  const dashboardSummary = useMemo(() => {
    const previousBody = bodyRecords[1];
    const weightDelta = latestBody?.weightKg !== undefined && previousBody?.weightKg !== undefined
      ? Number((latestBody.weightKg - previousBody.weightKg).toFixed(1))
      : undefined;

    const completionHints = [
      !latestBody ? '从第一条身体记录开始，变化才会慢慢浮现。' : '',
      !latestTraining ? '留下一次训练，节奏与投入才会被真正看见。' : '',
      !goal?.goalType ? '先把目标写清楚，之后每一步都会更有方向。' : '',
    ].filter(Boolean);

    return {
      nickname: profile?.nickname || user?.nickname || '训练者',
      phase: profile?.profile?.trainingPhase || 'MVP 记录阶段',
      weightDelta,
      completionHints,
      totalBodyRecords: bodyRecords.length,
      totalTrainingRecords: trainingRecords.length,
    };
  }, [bodyRecords, goal?.goalType, latestBody?.weightKg, latestTraining, profile?.nickname, profile?.profile?.trainingPhase, user?.nickname]);

  const roleMessage = useMemo(() => {
    if (!user) {
      return '先登录，再开始记录和看趋势。';
    }

    const daySeed = new Date().getDate() + new Date().getMonth() * 31;
    const hasGoal = Boolean(goal?.goalType);
    const hasBodyRecord = dashboardSummary.totalBodyRecords > 0;
    const hasTrainingRecord = dashboardSummary.totalTrainingRecords > 0;

    const appendStateCue = (base: string) => {
      if (!hasGoal) {
        return `${base} 先把目标定下来，前进的方向会更清楚。`;
      }
      if (!hasBodyRecord) {
        return `${base} 从今天补下第一条记录，变化才会开始沉淀。`;
      }
      if (!hasTrainingRecord) {
        return `${base} 再补一次训练记录，你会更容易看见自己的节奏。`;
      }
      return `${base} 继续朝 ${formatGoalType(goal?.goalType)} 稳稳推进。`;
    };

    if (user.role === 'ADMIN') {
      const lines = adminWelcomeLines[dayPeriod];
      const base = lines[daySeed % lines.length];
      return studentCount ? `${base} 当前还可留意 ${studentCount} 位学员的最新进展。` : base;
    }

    if (user.role === 'COACH') {
      const lines = coachWelcomeLines[dayPeriod];
      const base = lines[daySeed % lines.length];
      const merged = studentCount ? `${base} 你正在陪伴 ${studentCount} 位学员向前。` : base;
      return !hasGoal || !hasBodyRecord || !hasTrainingRecord ? appendStateCue(merged) : merged;
    }

    const lines = personalWelcomeLines[dayPeriod];
    const base = lines[daySeed % lines.length];
    return appendStateCue(base);
  }, [dashboardSummary.totalBodyRecords, dashboardSummary.totalTrainingRecords, dayPeriod, goal?.goalType, studentCount, user]);

  const heroTickerItems = useMemo(() => [
    {
      key: 'phase',
      tone: 'blue',
      eyebrow: 'PHASE',
      value: dashboardSummary.phase,
      canJump: !profile?.profile?.trainingPhase,
      action: () => Taro.switchTab({ url: '/pages/mine/index' }),
      actionLabel: '去完善',
    },
    {
      key: 'archive',
      tone: 'ink',
      eyebrow: 'ARCHIVE',
      value: `${dashboardSummary.totalBodyRecords} 条记录`,
      canJump: dashboardSummary.totalBodyRecords === 0,
      action: () => Taro.switchTab({ url: '/pages/records/index' }),
      actionLabel: '去记录',
    },
    {
      key: 'focus',
      tone: 'violet',
      eyebrow: 'FOCUS',
      value: goal?.goalType ? formatGoalType(goal?.goalType) : '设定目标',
      canJump: !goal?.goalType,
      action: () => Taro.switchTab({ url: '/pages/mine/index' }),
      actionLabel: '去设置',
    },
  ], [dashboardSummary.phase, dashboardSummary.totalBodyRecords, goal?.goalType, profile?.profile?.trainingPhase]);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroTickerIndex((prev) => (prev + 1) % heroTickerItems.length);
    }, 2400);

    return () => clearInterval(timer);
  }, [heroTickerItems.length]);

  const quickActions = [
    {
      label: '记录',
      description: '补身体或训练数据',
      action: () => Taro.switchTab({ url: '/pages/records/index' }),
      icon: 'record' as const,
      gradient: 'linear-gradient(135deg, #EBF4FF 0%, #E0EFFF 58%, #D6E8FF 100%)',
      borderColor: 'rgba(100, 160, 255, 0.28)',
      accentColor: '#157AFF',
    },
    {
      label: '趋势',
      description: '查看最近变化',
      action: () => Taro.switchTab({ url: '/pages/trends/index' }),
      icon: 'trend' as const,
      gradient: 'linear-gradient(135deg, #F0FFF4 0%, #E4FFF0 58%, #D8FFEC 100%)',
      borderColor: 'rgba(34, 160, 107, 0.28)',
      accentColor: '#22A06B',
    },
    {
      label: '日历',
      description: '按天看训练安排',
      action: () => Taro.switchTab({ url: '/pages/calendar/index' }),
      icon: 'calendar' as const,
      gradient: 'linear-gradient(135deg, #FFF5F0 0%, #FFEFE8 58%, #FFE8E0 100%)',
      borderColor: 'rgba(255, 146, 94, 0.28)',
      accentColor: '#FF925E',
    },
    {
      label: '我的',
      description: '维护资料和目标',
      action: () => Taro.switchTab({ url: '/pages/mine/index' }),
      icon: 'mine' as const,
      gradient: 'linear-gradient(135deg, #F8F4FF 0%, #F0EBFF 58%, #E8E2FF 100%)',
      borderColor: 'rgba(139, 114, 255, 0.28)',
      accentColor: '#8B72FF',
    },
    ...(user?.role === 'ADMIN'
      ? [
          {
            label: '管理台',
            description: '审批教练与关系管理',
            action: () => Taro.navigateTo({ url: '/pages/admin/index' }),
            icon: 'home' as const,
            gradient: 'linear-gradient(135deg, #FFF9F0 0%, #FFF5E8 58%, #FFF0E0 100%)',
            borderColor: 'rgba(255, 183, 94, 0.28)',
            accentColor: '#FFB75E',
          },
        ]
      : []),
  ];

  if (!user) {
    return (
      <ScrollView scrollY style={pageStyle}>
        <View style={{ ...pageContentStyle, paddingTop: '20px', paddingBottom: '40px' }}>
          <View style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 18, 360), minHeight: '88vh', padding: '30px 26px 28px', background: 'linear-gradient(160deg, #F8FBFF 0%, #EAF2FD 36%, #D7E5F7 68%, #C9D7E8 100%)', position: 'relative', overflow: 'hidden' }}>
            <View style={{ position: 'absolute', top: '-40px', right: '-20px', width: '220px', height: '220px', borderRadius: '110px', background: 'radial-gradient(circle, rgba(39,124,255,0.22) 0%, rgba(39,124,255,0.08) 42%, rgba(39,124,255,0) 72%)' }} />
            <View style={{ position: 'absolute', left: '-30px', bottom: '120px', width: '200px', height: '200px', borderRadius: '100px', background: 'radial-gradient(circle, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0) 78%)' }} />
            <View style={{ position: 'absolute', right: '24px', top: '150px', width: '140px', height: '140px', borderRadius: '36px', border: '1px solid rgba(255,255,255,0.42)', transform: 'rotate(18deg)' }} />
            <View style={{ position: 'absolute', right: '52px', top: '178px', width: '112px', height: '112px', borderRadius: '28px', background: 'linear-gradient(135deg, rgba(255,255,255,0.48) 0%, rgba(151,190,240,0.18) 100%)', transform: 'rotate(18deg)' }} />

            <View style={{ position: 'relative', zIndex: 1, display: 'flex', minHeight: '82vh', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ color: '#5C7DAA', fontSize: '20px', fontWeight: '600', letterSpacing: '0.08em' }}>塑迹</Text>
                <Text style={{ ...pageHeroTitleStyle, marginTop: '18px', fontSize: '48px', lineHeight: '1.06' }}>
                  为训练留下
                  {'\n'}一条可见的轨迹
                </Text>
                <Text style={{ ...pageHeroSubtitleStyle, marginTop: '14px', fontSize: '24px', maxWidth: '520px', color: '#61758F' }}>
                  身体变化、训练反馈与阶段趋势，回到同一块安静的界面里。
                </Text>
              </View>

              <View style={{ marginTop: '24px' }}>
                <View style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <View style={{ width: '10px', height: '10px', borderRadius: '5px', background: '#157AFF' }} />
                  <View style={{ width: '28px', height: '10px', borderRadius: '5px', background: 'rgba(21,122,255,0.4)' }} />
                  <View style={{ width: '54px', height: '10px', borderRadius: '5px', background: 'rgba(21,122,255,0.16)' }} />
                </View>
                <Button style={{ ...accentButtonStyle, height: '84px', lineHeight: '84px', fontSize: '30px', fontWeight: '700' }} onClick={() => void login()}>
                  微信快捷登录
                </Button>
                <Text style={{ display: 'block', marginTop: '14px', color: '#7B8698', fontSize: '20px', textAlign: 'center' }}>开始记录，然后看到变化。</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView scrollY style={pageStyle}>
      <View style={pageContentStyle}>
      <View
        style={{
          ...cardStyle,
          ...createPressableCardStyle(),
          ...createEnterStyle(entered, 20, 360),
          padding: '18px 18px 16px',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(243,248,255,0.96) 42%, rgba(226,236,249,0.96) 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <View style={{ position: 'absolute', top: '-72px', right: '-12px', width: '188px', height: '188px', borderRadius: '94px', background: 'radial-gradient(circle, rgba(21,122,255,0.18) 0%, rgba(21,122,255,0.06) 38%, rgba(21,122,255,0) 72%)' }} />
        <View style={{ position: 'absolute', left: '-42px', bottom: '-60px', width: '150px', height: '150px', borderRadius: '75px', background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 52%, rgba(255,255,255,0) 74%)' }} />
        <View style={{ position: 'absolute', right: '18px', top: '16px', width: '96px', height: '96px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.42)', transform: 'rotate(16deg)' }} />

        <View style={{ position: 'relative', zIndex: 1 }}>
          <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ display: 'block', fontSize: '14px', letterSpacing: '0.24em', color: '#7A97BE' }}>{heroGreeting}</Text>
              <Text style={{ ...pageHeroTitleStyle, marginTop: '6px', fontSize: '40px', lineHeight: '1.02', color: '#132033' }}>
                {dashboardSummary.nickname}
              </Text>
            </View>
            <View style={{ padding: '7px 11px', borderRadius: '999px', background: 'rgba(255,255,255,0.66)', border: '1px solid rgba(255,255,255,0.84)' }}>
              <Text style={{ color: '#4C78AE', fontSize: '15px', fontWeight: '600', letterSpacing: '0.1em' }}>{heroBadge}</Text>
            </View>
          </View>

          <Text style={{ ...pageHeroSubtitleStyle, marginTop: '8px', color: '#5B6B83', maxWidth: '560px', lineHeight: '1.6', fontSize: '18px' }}>
            {roleMessage}
          </Text>

          <View
            style={{
              position: 'relative',
              marginTop: '18px',
              padding: '8px 0 4px',
            }}
          >
            <View
              style={{
                position: 'absolute',
                left: '0',
                right: '0',
                top: '12px',
                height: '52px',
                borderRadius: '28px',
                background: 'linear-gradient(135deg, rgba(245,248,252,0.82) 0%, rgba(255,255,255,0.52) 100%)',
                border: '1px solid rgba(255,255,255,0.72)',
              }}
            />
            <View style={{ position: 'relative', height: '60px', overflow: 'hidden', zIndex: 1 }}>
              {heroTickerItems.concat(heroTickerItems[0]).map((item, index) => {
                const offset = index - heroTickerIndex;
                const toneStyle = item.tone === 'ink'
                  ? {
                      background: 'linear-gradient(145deg, rgba(19,32,51,0.9) 0%, rgba(37,58,89,0.92) 100%)',
                      border: '1px solid rgba(49, 72, 108, 0.66)',
                      shadow: '0 10px 20px rgba(19,32,51,0.14)',
                      eyebrow: 'rgba(196,216,244,0.82)',
                      value: '#FFFFFF',
                      dot: 'linear-gradient(135deg, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.08) 100%)',
                      outline: 'rgba(255,255,255,0.08)',
                    }
                  : item.tone === 'violet'
                    ? {
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(250,246,255,0.92) 100%)',
                      border: '1px solid rgba(223, 216, 247, 0.82)',
                      shadow: '0 8px 18px rgba(141, 126, 196, 0.05), inset 0 1px 0 rgba(255,255,255,0.92)',
                      eyebrow: '#7A6BA5',
                      value: '#22314A',
                      dot: 'linear-gradient(135deg, rgba(139,114,255,0.16) 0%, rgba(139,114,255,0.08) 100%)',
                      outline: 'rgba(139,114,255,0.1)',
                    }
                  : {
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(247,250,254,0.94) 100%)',
                      border: '1px solid rgba(213, 221, 232, 0.76)',
                      shadow: '0 8px 18px rgba(125, 142, 168, 0.06), inset 0 1px 0 rgba(255,255,255,0.92)',
                      eyebrow: '#6E85A3',
                      value: '#162033',
                      dot: 'linear-gradient(135deg, rgba(21,122,255,0.16) 0%, rgba(21,122,255,0.08) 100%)',
                      outline: 'rgba(21,122,255,0.1)',
                    };

                return (
                  <View
                    key={`${item.key}-${index}`}
                    style={{
                      position: 'absolute',
                      left: '0',
                      right: '0',
                      top: '8px',
                      height: '42px',
                      padding: '7px 12px 7px 14px',
                      borderRadius: '999px 28px 999px 999px',
                      background: toneStyle.background,
                      border: toneStyle.border,
                      boxShadow: toneStyle.shadow,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transform: `translateY(${offset * 52}px) scale(${offset === 0 ? 1 : 0.96})`,
                      opacity: offset === 0 ? '1' : offset === 1 ? '0.22' : '0',
                      transition: 'transform 560ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 420ms ease, box-shadow 240ms ease',
                      pointerEvents: offset === 0 ? 'auto' : 'none',
                    }}
                    onClick={() => {
                      if (offset === 0 && item.canJump) {
                        item.action();
                      }
                    }}
                  >
                    <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <View style={{ width: '24px', height: '24px', borderRadius: '999px', background: toneStyle.dot, border: `1px solid ${toneStyle.outline}` }} />
                      <Text style={{ color: toneStyle.eyebrow, fontSize: '14px', letterSpacing: '0.14em' }}>{item.eyebrow}</Text>
                    </View>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '68%' }}>
                      <Text style={{ color: toneStyle.value, fontSize: item.tone === 'ink' ? '20px' : '17px', fontWeight: '700' }}>
                        {item.value}
                      </Text>
                      {item.canJump && (
                        <View style={{ padding: '3px 8px', borderRadius: '999px', background: item.tone === 'ink' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.66)', border: item.tone === 'ink' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.72)' }}>
                          <Text style={{ color: item.tone === 'ink' ? '#FFFFFF' : toneStyle.eyebrow, fontSize: '12px', fontWeight: '600' }}>{item.actionLabel}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </View>

      <View style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 28, 420), padding: '16px 16px 14px' }}>
        <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <Text style={sectionEyebrowStyle}>TODAY METRICS</Text>
            <Text style={sectionHeadingStyle}>今日总览</Text>
          </View>
          <View style={sectionMetaWrapStyle}>
            <View style={sectionMetaLineStyle} />
            <Text style={sectionMetaTextStyle}>LIVE</Text>
          </View>
        </View>

        <View
          style={{
            position: 'relative',
            marginTop: '14px',
            padding: '10px 0 6px',
          }}
        >
          <View
            style={{
              position: 'absolute',
              left: '0',
              right: '0',
              top: '14px',
              height: '92px',
              borderRadius: '32px',
              background: 'linear-gradient(145deg, rgba(245,248,252,0.76) 0%, rgba(255,255,255,0.54) 100%)',
              border: '1px solid rgba(230, 236, 245, 0.84)',
            }}
          />
          <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', position: 'relative', zIndex: 1 }}>
            <View style={{ padding: '14px 14px 12px', borderRadius: '999px 24px 999px 999px', background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(246,250,255,0.94) 100%)', border: '1px solid rgba(213, 221, 232, 0.76)', boxShadow: lightPanelShadow, transition: interactiveTransition }}>
              <Text style={{ color: '#6F88A8', fontSize: '14px', letterSpacing: '0.14em' }}>WEIGHT</Text>
              <Text style={{ display: 'block', marginTop: '6px', fontSize: '30px', fontWeight: '700', color: '#157AFF', lineHeight: '1' }}>{latestBody?.weightKg ?? '--'} kg</Text>
              <Text style={{ display: 'block', marginTop: '6px', color: '#6D7686', fontSize: '16px' }}>
                {dashboardSummary.weightDelta !== undefined
                  ? `较上一条 ${dashboardSummary.weightDelta > 0 ? '+' : ''}${dashboardSummary.weightDelta} kg`
                  : '待形成变化曲线'}
              </Text>
            </View>

            <View style={{ padding: '14px 14px 12px', borderRadius: '24px 999px 999px 999px', background: 'linear-gradient(145deg, rgba(19,32,51,0.9) 0%, rgba(37,58,89,0.92) 100%)', border: '1px solid rgba(49, 72, 108, 0.66)', boxShadow: darkPanelShadow, transition: interactiveTransition }}>
              <Text style={{ color: 'rgba(196,216,244,0.82)', fontSize: '14px', letterSpacing: '0.14em' }}>TRAINING</Text>
              <Text style={{ display: 'block', marginTop: '6px', fontSize: '30px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1' }}>{dashboardSummary.totalTrainingRecords}</Text>
              <Text style={{ display: 'block', marginTop: '6px', color: 'rgba(226,236,247,0.76)', fontSize: '16px' }}>累计训练次数</Text>
            </View>

            <View style={{ padding: '14px 14px 12px', borderRadius: '999px 999px 24px 999px', background: 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(250,246,255,0.92) 100%)', border: '1px solid rgba(223, 216, 247, 0.82)', boxShadow: softPanelShadow, transition: interactiveTransition }}>
              <Text style={{ color: '#7A6BA5', fontSize: '14px', letterSpacing: '0.14em' }}>GOAL</Text>
              <Text style={{ display: 'block', marginTop: '6px', fontSize: '24px', fontWeight: '700', color: '#352D57', lineHeight: '1.1' }}>{formatGoalType(goal?.goalType)}</Text>
              <Text style={{ display: 'block', marginTop: '6px', color: '#6D7686', fontSize: '16px' }}>
                {goal?.targetCycleDays ? `${goal.targetCycleDays} 天周期` : '等待你定义节奏'}
              </Text>
            </View>

            <View style={{ padding: '14px 14px 12px', borderRadius: '999px 999px 999px 24px', background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(247,248,251,0.94) 100%)', border: '1px solid rgba(221, 226, 236, 0.8)', boxShadow: lightPanelShadow, transition: interactiveTransition }}>
              <Text style={{ color: '#6F7C92', fontSize: '14px', letterSpacing: '0.14em' }}>RECORDS</Text>
              <Text style={{ display: 'block', marginTop: '6px', fontSize: '30px', fontWeight: '700', color: '#172033', lineHeight: '1' }}>{dashboardSummary.totalBodyRecords}</Text>
              <Text style={{ display: 'block', marginTop: '6px', color: '#6D7686', fontSize: '16px' }}>记录越连续越清晰</Text>
            </View>
          </View>
        </View>
        {adminSummary && (
          <View style={{ marginTop: '14px', padding: '18px', borderRadius: '24px', background: 'linear-gradient(135deg, #F6F8FF 0%, #EEF1FB 100%)' }}>
            <Text style={{ color: '#5E6F97' }}>管理员摘要</Text>
            <Text style={{ display: 'block', marginTop: '8px', color: '#23304B' }}>平台用户数：{adminSummary.userCount}</Text>
            <Text style={{ display: 'block', marginTop: '6px', color: '#23304B' }}>待审批教练申请：{adminSummary.pendingCoachApplications}</Text>
          </View>
        )}
      </View>

      <View style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 36, 480), padding: '16px 16px 14px' }}>
        <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <Text style={sectionEyebrowStyle}>LATEST SESSION</Text>
            <Text style={sectionHeadingStyle}>最近训练摘要</Text>
          </View>
          <View style={sectionMetaWrapStyle}>
            <View style={sectionMetaLineStyle} />
            <Text style={sectionMetaTextStyle}>TRACK</Text>
          </View>
        </View>

        {latestTraining ? (
          <View style={{ marginTop: '14px', display: 'flex', gap: '12px' }}>
            <View style={{ padding: '16px 16px 14px', borderRadius: '999px 26px 999px 999px', background: 'linear-gradient(145deg, rgba(19,32,51,0.9) 0%, rgba(37,58,89,0.92) 100%)', border: '1px solid rgba(49, 72, 108, 0.66)', boxShadow: darkPanelShadow, transition: interactiveTransition }}>
              <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: 'rgba(196,216,244,0.82)', fontSize: '14px', letterSpacing: '0.14em' }}>SESSION</Text>
                <Text style={{ color: 'rgba(226,236,247,0.72)', fontSize: '14px' }}>{latestTraining.sessionDate}</Text>
              </View>
              <Text style={{ display: 'block', marginTop: '10px', fontSize: '30px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.05' }}>{latestTraining.bodyPart || '训练记录'}</Text>
              <Text style={{ display: 'block', marginTop: '8px', color: 'rgba(226,236,247,0.78)', fontSize: '16px', lineHeight: '1.5' }}>
                {latestTraining.note || '这次训练仍然值得被认真记住。'}
              </Text>
            </View>

            <View style={{ display: 'flex', gap: '12px' }}>
              <View style={{ padding: '14px 14px 12px', borderRadius: '24px 999px 999px 999px', background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(246,250,255,0.94) 100%)', border: '1px solid rgba(213, 221, 232, 0.76)', boxShadow: lightPanelShadow, transition: interactiveTransition }}>
                <Text style={{ color: '#6F88A8', fontSize: '14px', letterSpacing: '0.14em' }}>MOVEMENT</Text>
                <Text style={{ display: 'block', marginTop: '6px', fontSize: '22px', fontWeight: '700', color: '#162033', lineHeight: '1.15' }}>
                  {latestTraining.exercises?.[0]?.name || '本次训练动作'}
                </Text>
              </View>

              <View style={{ padding: '14px 14px 12px', borderRadius: '999px 999px 999px 24px', background: 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(250,246,255,0.92) 100%)', border: '1px solid rgba(223, 216, 247, 0.82)', boxShadow: softPanelShadow, transition: interactiveTransition }}>
                <Text style={{ color: '#7A6BA5', fontSize: '14px', letterSpacing: '0.14em' }}>LOAD</Text>
                <Text style={{ display: 'block', marginTop: '6px', fontSize: '22px', fontWeight: '700', color: '#352D57', lineHeight: '1.15' }}>
                  {latestTraining.exercises?.[0]?.sets?.[0]?.weightKg || '-'} kg × {latestTraining.exercises?.[0]?.sets?.[0]?.reps || '-'}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={{ marginTop: '14px', padding: '16px 16px 14px', borderRadius: '999px 26px 999px 999px', background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(246,250,255,0.94) 100%)', border: '1px solid rgba(213, 221, 232, 0.76)', boxShadow: lightPanelShadow, transition: interactiveTransition }}>
            <Text style={{ color: '#6F88A8', fontSize: '14px', letterSpacing: '0.14em' }}>SESSION</Text>
            <Text style={{ display: 'block', marginTop: '6px', fontSize: '22px', fontWeight: '700', color: '#162033' }}>训练旅程尚未开始</Text>
            <Text style={{ display: 'block', marginTop: '8px', color: '#6D7686', fontSize: '16px' }}>从第一条训练开始，让每一次投入都被认真看见。</Text>
          </View>
        )}
      </View>

      <View style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 44, 540), padding: '16px 16px 14px' }}>
        <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <Text style={sectionEyebrowStyle}>GOALS & RHYTHM</Text>
            <Text style={sectionHeadingStyle}>目标与提醒</Text>
          </View>
          <View style={sectionMetaWrapStyle}>
            <View style={sectionMetaLineStyle} />
            <Text style={sectionMetaTextStyle}>FOCUS</Text>
          </View>
        </View>

        <View style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
          <View style={{ flex: 1.05, padding: '16px 16px 14px', borderRadius: '999px 28px 999px 999px', background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(246,250,255,0.94) 100%)', border: '1px solid rgba(213, 221, 232, 0.76)', boxShadow: lightPanelShadow, transition: interactiveTransition }}>
            <Text style={{ color: '#6F88A8', fontSize: '14px', letterSpacing: '0.14em' }}>TARGET</Text>
            <Text style={{ display: 'block', marginTop: '8px', fontSize: '24px', fontWeight: '700', color: '#162033', lineHeight: '1.15' }}>
              {goal?.targetWeightKg ? `体重 ${goal.targetWeightKg} kg` : '写下你的目标'}
            </Text>
            <Text style={{ display: 'block', marginTop: '8px', color: '#6D7686', fontSize: '16px', lineHeight: '1.6' }}>
              {goal?.targetBodyFat || goal?.targetWaistCm
                ? `${goal?.targetBodyFat ? `体脂 ${goal.targetBodyFat}%` : ''}${goal?.targetBodyFat && goal?.targetWaistCm ? ' · ' : ''}${goal?.targetWaistCm ? `腰围 ${goal.targetWaistCm} cm` : ''}`
                : '先为自己写下一个清晰目标，后面的变化会更有意义。'}
            </Text>
          </View>

          <View style={{ flex: 0.95, padding: '16px 16px 14px', borderRadius: '24px 999px 999px 999px', background: 'linear-gradient(145deg, rgba(19,32,51,0.9) 0%, rgba(37,58,89,0.92) 100%)', border: '1px solid rgba(49, 72, 108, 0.66)', boxShadow: darkPanelShadow, transition: interactiveTransition }}>
            <Text style={{ color: 'rgba(196,216,244,0.82)', fontSize: '14px', letterSpacing: '0.14em' }}>ENERGY</Text>
            <Text style={{ display: 'block', marginTop: '8px', fontSize: '34px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1' }}>{Math.min(100, dashboardSummary.totalTrainingRecords * 18 + dashboardSummary.totalBodyRecords * 12)}%</Text>
            <Text style={{ display: 'block', marginTop: '8px', color: 'rgba(226,236,247,0.76)', fontSize: '16px', lineHeight: '1.55' }}>
              {dashboardSummary.totalTrainingRecords + dashboardSummary.totalBodyRecords > 0
                ? '记录与训练都在积累，节奏正在慢慢成形。'
                : '从今天开始留下痕迹，身体的变化会一点点回应你。'}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
          {dashboardSummary.completionHints.length ? (
            dashboardSummary.completionHints.map((hint, index) => (
              <View key={hint} style={{ padding: '12px 14px', borderRadius: index % 2 === 0 ? '999px 24px 999px 999px' : '24px 999px 999px 999px', background: 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(248,251,255,0.94) 100%)', border: '1px solid rgba(212, 223, 240, 0.8)', boxShadow: lightPanelShadow, transition: interactiveTransition }}>
                <Text style={{ color: '#5C6678', fontSize: '16px', lineHeight: '1.5' }}>{hint}</Text>
              </View>
            ))
          ) : (
            <View style={{ padding: '12px 14px', borderRadius: '999px 24px 999px 999px', background: 'linear-gradient(135deg, rgba(236,250,242,0.98) 0%, rgba(244,255,248,0.94) 100%)', border: '1px solid rgba(193, 230, 210, 0.84)', boxShadow: lightPanelShadow, transition: interactiveTransition }}>
              <Text style={{ color: '#327157', fontSize: '16px', lineHeight: '1.5' }}>目标、训练与记录都已就绪，可以安心朝下一阶段推进。</Text>
            </View>
          )}
        </View>
      </View>

      <View style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 52, 600), padding: '14px', paddingTop: '12px' }}>
        <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <Text style={sectionEyebrowStyle}>EXPRESS LANE</Text>
            <Text style={sectionHeadingStyle}>快捷动线</Text>
          </View>
          <View style={sectionMetaWrapStyle}>
            <View style={sectionMetaLineStyle} />
            <Text style={sectionMetaTextStyle}>SWIPE</Text>
          </View>
        </View>
        <View
          style={{
            position: 'relative',
            marginTop: '12px',
            marginLeft: '-2px',
            marginRight: '-2px',
            padding: '8px 0 6px',
          }}
        >
          <View
            style={{
              position: 'absolute',
              left: '0',
              right: '0',
              top: '10px',
              height: '30px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, rgba(242,246,251,0.92) 0%, rgba(248,251,255,0.78) 100%)',
              border: '1px solid rgba(223, 230, 239, 0.7)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.72)',
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: '16px',
              top: '17px',
              width: '34px',
              height: '14px',
              borderRadius: '999px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.48) 0%, rgba(255,255,255,0) 100%)',
            }}
          />
          <ScrollView
            scrollX
            enhanced
            showScrollbar={false}
            style={{ whiteSpace: 'nowrap', position: 'relative', zIndex: 1 }}
          >
            <View style={{ display: 'flex', gap: '8px', padding: '2px 2px 3px', width: 'max-content' }}>
              {quickActions.slice(0, 4).map((item, index) => {
                const icon = item.icon ? tabBarIconMap[item.icon]({ selected: true }) : null;
                const floatingTagShapes = [
                  {
                    width: '112px',
                    borderRadius: '999px 28px 999px 999px',
                    padding: '7px 12px 7px 9px',
                    flexDirection: 'row',
                    marginTop: '0px',
                  },
                  {
                    width: '118px',
                    borderRadius: '28px 999px 999px 999px',
                    padding: '7px 9px 7px 12px',
                    flexDirection: 'row-reverse',
                    marginTop: '8px',
                  },
                  {
                    width: '108px',
                    borderRadius: '999px 999px 26px 999px',
                    padding: '7px 11px 7px 9px',
                    flexDirection: 'row',
                    marginTop: '3px',
                  },
                  {
                    width: '120px',
                    borderRadius: '999px 999px 999px 26px',
                    padding: '7px 9px 7px 12px',
                    flexDirection: 'row-reverse',
                    marginTop: '9px',
                  },
                ][index];
                const accentTone = item.accentColor === '#157AFF'
                  ? '21,122,255'
                  : item.accentColor === '#22A06B'
                    ? '34,160,107'
                    : item.accentColor === '#FF925E'
                      ? '255,146,94'
                      : '139,114,255';

                return (
                  <Button
                    key={item.label}
                    style={{
                      position: 'relative',
                      width: floatingTagShapes.width,
                      height: '40px',
                      marginTop: floatingTagShapes.marginTop,
                      padding: floatingTagShapes.padding,
                      borderRadius: floatingTagShapes.borderRadius,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(246,249,253,0.96) 100%)',
                      border: '1px solid rgba(213, 221, 232, 0.7)',
                      textAlign: 'left',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      flexDirection: floatingTagShapes.flexDirection,
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '7px',
                      boxShadow: lightPanelShadow,
                      transition: interactiveTransition,
                      overflow: 'hidden',
                    }}
                    onClick={item.action}
                  >
                    <View
                      style={{
                        position: 'absolute',
                        width: '30px',
                        height: '30px',
                        borderRadius: '999px',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0) 72%)',
                        top: '-6px',
                        right: floatingTagShapes.flexDirection === 'row' ? '-4px' : 'auto',
                        left: floatingTagShapes.flexDirection === 'row-reverse' ? '-4px' : 'auto',
                      }}
                    />
                    <View style={{ position: 'relative', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '999px', background: `linear-gradient(135deg, rgba(${accentTone}, 0.14) 0%, rgba(${accentTone}, 0.08) 100%)`, flexShrink: 0, border: `1px solid rgba(${accentTone}, 0.1)` }}>
                      {icon && (
                        <>
                          {'wrapper' in icon && <View style={{ ...icon.wrapper, width: '13px', height: '13px' } as never} />}
                          {'roof' in icon && <View style={icon.roof as never} />}
                          {'body' in icon && <View style={icon.body as never} />}
                          {'capsule' in icon && <View style={{ ...icon.capsule, width: '11px', height: '7px' } as never} />}
                          {'dot' in icon && <View style={icon.dot as never} />}
                          {'lineA' in icon && <View style={icon.lineA as never} />}
                          {'lineB' in icon && <View style={icon.lineB as never} />}
                          {'lineC' in icon && <View style={icon.lineC as never} />}
                          {'shell' in icon && <View style={{ ...icon.shell, width: '11px', height: '9px' } as never} />}
                          {'bar' in icon && <View style={icon.bar as never} />}
                          {'pinLeft' in icon && <View style={icon.pinLeft as never} />}
                          {'pinRight' in icon && <View style={icon.pinRight as never} />}
                          {'head' in icon && <View style={icon.head as never} />}
                        </>
                      )}
                    </View>
                    <View style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '6px' }}>
                      <Text style={{ display: 'block', fontWeight: '600', color: '#23304B', fontSize: '12px', lineHeight: '1', letterSpacing: '0.04em' }}>{item.label}</Text>
                      <View style={{ width: '10px', height: '1.5px', borderRadius: '999px', background: `rgba(${accentTone}, 0.28)` }} />
                    </View>
                  </Button>
                );
              })}
            </View>
          </ScrollView>
        </View>
        {quickActions.length > 4 && (
          <Button
            key={quickActions[4].label}
            style={{
              marginTop: '10px',
              padding: '10px 14px',
              borderRadius: '12px',
              background: 'rgba(255, 183, 94, 0.08)',
              border: '1px solid rgba(255, 183, 94, 0.2)',
              textAlign: 'left',
              boxShadow: lightPanelShadow,
              transition: interactiveTransition,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
            onClick={quickActions[4].action}
          >
            <View style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255, 183, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: '12px', height: '12px', borderRadius: '3px', border: '2px solid #FFB75E' }} />
            </View>
            <Text style={{ display: 'block', fontWeight: '600', color: '#23304B', fontSize: '16px', lineHeight: '1.2' }}>{quickActions[4].label}</Text>
          </Button>
        )}
      </View>

      <Button style={{ ...accentButtonStyle, marginBottom: '120px', opacity: loading ? '0.7' : '1' }} loading={loading} onClick={() => void login()}>
        {user ? '刷新登录态与首页数据' : '微信快捷登录'}
      </Button>
      </View>
    </ScrollView>
  );
}
