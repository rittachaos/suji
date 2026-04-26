import Taro from '@tarojs/taro';
import { Button, ScrollView, Text, View } from '@tarojs/components';
import { useEffect, useMemo, useState } from 'react';
import { fetchCoachStudents } from '@/services/modules/coaches';
import { fetchDashboardOverview } from '@/services/modules/dashboard';
import { useUserStore } from '@/store/user';
import { BodyRecordPayload, TrainingSessionPayload } from '@/types/api';
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

const quickActionStyle = {
  background: 'rgba(248, 250, 255, 0.92)',
  color: '#26415E',
  borderRadius: '24px',
  textAlign: 'left',
  padding: '18px 20px',
  border: '1px solid rgba(196, 212, 232, 0.75)',
};

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

export default function IndexPage() {
  const { user, login, bootstrap } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [entered, setEntered] = useState(false);
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

  const dashboardSummary = useMemo(() => {
    const previousBody = bodyRecords[1];
    const weightDelta = latestBody?.weightKg !== undefined && previousBody?.weightKg !== undefined
      ? Number((latestBody.weightKg - previousBody.weightKg).toFixed(1))
      : undefined;

    const completionHints = [
      !latestBody ? '建议先补一条身体记录，后续趋势会更完整' : '',
      !latestTraining ? '建议补一条训练记录，首页会显示最近训练摘要' : '',
      !goal?.goalType ? '可以先设一个阶段目标，方便后面看进度' : '',
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
    if (user.role === 'ADMIN') {
      return `当前是管理员视角，也可在移动端快速查看自己的训练状态${studentCount ? `，当前关联学员 ${studentCount} 人` : ''}。`;
    }
    if (user.role === 'COACH') {
      return `当前是教练视角${studentCount ? `，你正在管理 ${studentCount} 名学员` : ''}，可以继续做代录和趋势查看。`;
    }
    return '当前是个人训练视角，先把记录和趋势链路跑通最重要。';
  }, [studentCount, user]);

  const quickActions = [
    {
      label: '去记录',
      description: '补身体或训练数据',
      action: () => Taro.switchTab({ url: '/pages/records/index' }),
    },
    {
      label: '看趋势',
      description: '查看最近变化',
      action: () => Taro.switchTab({ url: '/pages/trends/index' }),
    },
    {
      label: '去我的',
      description: '维护资料和目标',
      action: () => Taro.switchTab({ url: '/pages/mine/index' }),
    },
    {
      label: '打开奖历',
      description: '按天看训练安排',
      action: () => Taro.switchTab({ url: '/pages/calendar/index' }),
    },
    ...(user?.role === 'ADMIN'
      ? [
          {
            label: '管理台',
            description: '审批教练与关系管理',
            action: () => Taro.navigateTo({ url: '/pages/admin/index' }),
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
      <View style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 20, 360), background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(235,243,255,0.88) 58%, rgba(217,231,250,0.96) 100%)' }}>
        <Text style={{ display: 'block', fontSize: '22px', color: '#4E7CB7' }}>欢迎回来</Text>
        <Text style={{ ...pageHeroTitleStyle, marginTop: '10px', fontSize: '42px' }}>
          {dashboardSummary.nickname}
        </Text>
        <Text style={{ ...pageHeroSubtitleStyle, marginTop: '10px', color: '#5C6678' }}>{roleMessage}</Text>
        <View style={{ marginTop: '18px', padding: '18px 18px', borderRadius: '24px', background: 'rgba(255,255,255,0.64)', border: '1px solid rgba(255,255,255,0.85)' }}>
          <Text style={{ color: '#6F88A8' }}>当前阶段</Text>
          <Text style={{ display: 'block', marginTop: '6px', fontSize: '30px', fontWeight: '700', color: '#162033' }}>
            {dashboardSummary.phase}
          </Text>
        </View>
      </View>

      <View style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 28, 420) }}>
        <Text style={sectionTitleStyle}>今日总览</Text>
        <View style={{ display: 'flex', gap: '14px', marginTop: '18px' }}>
          <View style={{ flex: 1, padding: '20px', borderRadius: '24px', background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F9FF 100%)', border: '1px solid rgba(210, 224, 244, 0.7)' }}>
            <Text style={{ color: '#6F88A8' }}>最新体重</Text>
            <Text style={{ ...metricValueLargeStyle, color: '#157AFF' }}>
              {latestBody?.weightKg ?? '--'} kg
            </Text>
            <Text style={{ display: 'block', marginTop: '6px', color: '#6D7686' }}>
              {dashboardSummary.weightDelta !== undefined
                ? `较上一条 ${dashboardSummary.weightDelta > 0 ? '+' : ''}${dashboardSummary.weightDelta} kg`
                : '还不能计算变化'}
            </Text>
          </View>
          <View style={{ flex: 1, padding: '20px', borderRadius: '24px', background: 'linear-gradient(135deg, #FFFFFF 0%, #F1F7F4 100%)', border: '1px solid rgba(208, 228, 217, 0.7)' }}>
            <Text style={{ color: '#5B8572' }}>累计训练</Text>
            <Text style={{ ...metricValueLargeStyle, color: '#22A06B' }}>
              {dashboardSummary.totalTrainingRecords}
            </Text>
            <Text style={{ display: 'block', marginTop: '6px', color: '#6D7686' }}>近 6 次记录已同步首页</Text>
          </View>
        </View>
        <View style={{ display: 'flex', gap: '14px', marginTop: '14px' }}>
          <View style={{ flex: 1, padding: '20px', borderRadius: '24px', background: 'linear-gradient(135deg, #FFFFFF 0%, #F4F2FF 100%)', border: '1px solid rgba(221, 216, 247, 0.76)' }}>
            <Text style={{ color: '#7A6BA5' }}>目标类型</Text>
            <Text style={{ display: 'block', marginTop: '8px', fontSize: '28px', fontWeight: '700', color: '#352D57', letterSpacing: '-0.02em' }}>
              {formatGoalType(goal?.goalType)}
            </Text>
            <Text style={{ display: 'block', marginTop: '6px', color: '#6D7686' }}>
              {goal?.targetCycleDays ? `${goal.targetCycleDays} 天周期` : '还没有设周期'}
            </Text>
          </View>
          <View style={{ flex: 1, padding: '20px', borderRadius: '24px', background: 'linear-gradient(135deg, #FFFFFF 0%, #F7F7FA 100%)', border: '1px solid rgba(221, 226, 236, 0.8)' }}>
            <Text style={{ color: '#6F7C92' }}>身体记录</Text>
            <Text style={{ ...metricValueLargeStyle, color: '#172033' }}>
              {dashboardSummary.totalBodyRecords}
            </Text>
            <Text style={{ display: 'block', marginTop: '6px', color: '#6D7686' }}>记录越连续，趋势越有参考价值</Text>
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

      <View style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 36, 480) }}>
        <Text style={sectionTitleStyle}>最近训练摘要</Text>
        {latestTraining ? (
          <View style={{ marginTop: '16px', padding: '20px', borderRadius: '24px', background: 'linear-gradient(135deg, #FFFFFF 0%, #F4F8FF 100%)', border: '1px solid rgba(210, 224, 244, 0.8)' }}>
            <Text style={{ color: '#172033', fontWeight: '700' }}>{latestTraining.sessionDate} · {latestTraining.bodyPart}</Text>
            <Text style={{ display: 'block', marginTop: '8px', color: '#5F6A7B' }}>
              {latestTraining.exercises?.[0]?.name || '未填写动作'} · {latestTraining.exercises?.[0]?.sets?.[0]?.weightKg || '-'} kg x {latestTraining.exercises?.[0]?.sets?.[0]?.reps || '-'}
            </Text>
            <Text style={{ display: 'block', marginTop: '8px', color: '#8791A3' }}>
              {latestTraining.note || '这次训练还没有补充训练感受。'}
            </Text>
          </View>
        ) : (
          <Text style={{ display: 'block', marginTop: '14px', color: '#8791A3' }}>还没有训练记录，可以先从记录页补一条。</Text>
        )}
      </View>

      <View style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 44, 540) }}>
        <Text style={sectionTitleStyle}>目标与提醒</Text>
        <View style={{ marginTop: '16px', padding: '20px', borderRadius: '24px', background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FD 100%)', border: '1px solid rgba(224, 230, 242, 0.8)' }}>
          <Text style={{ color: '#46597A', fontWeight: '700' }}>当前目标</Text>
          <Text style={{ display: 'block', marginTop: '8px', color: '#5F6A7B', lineHeight: '1.8' }}>
            {goal?.targetWeightKg
              ? `目标体重 ${goal.targetWeightKg} kg`
              : '还没有设置目标体重，可在“我的”里补充目标。'}
            {goal?.targetBodyFat ? ` · 目标体脂 ${goal.targetBodyFat}%` : ''}
            {goal?.targetWaistCm ? ` · 目标腰围 ${goal.targetWaistCm} cm` : ''}
          </Text>
        </View>
        <View style={{ marginTop: '14px' }}>
          {dashboardSummary.completionHints.length ? (
            dashboardSummary.completionHints.map((hint) => (
              <View key={hint} style={{ marginTop: '10px', padding: '14px 16px', borderRadius: '20px', background: 'rgba(248, 251, 255, 0.96)', border: '1px solid rgba(212, 223, 240, 0.8)' }}>
                <Text style={{ color: '#5C6678' }}>{hint}</Text>
              </View>
            ))
          ) : (
            <View style={{ marginTop: '10px', padding: '14px 16px', borderRadius: '20px', background: 'linear-gradient(135deg, #ECFAF2 0%, #F4FFF8 100%)' }}>
              <Text style={{ color: '#327157' }}>记录、训练和目标都已有基础数据，可以开始重点看趋势和阶段总结了。</Text>
            </View>
          )}
        </View>
        <View style={{ marginTop: '16px', padding: '18px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(21,122,255,0.08) 0%, rgba(114,185,255,0.12) 100%)', border: '1px solid rgba(175, 210, 248, 0.6)' }}>
          <Text style={{ color: '#5074A1', fontSize: '22px' }}>身体能量环</Text>
          <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
            <View style={{ width: '108px', height: '108px', borderRadius: '54px', border: '10px solid rgba(21,122,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 8px rgba(255,255,255,0.8)' }}>
              <View style={{ width: '78px', height: '78px', borderRadius: '39px', background: 'linear-gradient(135deg, #157AFF 0%, #72B8FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#FFFFFF', fontSize: '24px', fontWeight: '700' }}>{Math.min(100, dashboardSummary.totalTrainingRecords * 18 + dashboardSummary.totalBodyRecords * 12)}%</Text>
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: '18px' }}>
              <Text style={{ color: '#23304B', fontWeight: '700' }}>今日恢复节奏</Text>
              <Text style={{ display: 'block', marginTop: '8px', color: '#667385', lineHeight: '1.7' }}>
                最近记录完整度和训练频率都在稳定上升，当前节奏适合继续保持轻微递进。
              </Text>
              <View style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <View style={{ width: '10px', height: '10px', borderRadius: '5px', background: '#157AFF' }} />
                <View style={{ width: '18px', height: '10px', borderRadius: '5px', background: 'rgba(21,122,255,0.38)' }} />
                <View style={{ width: '26px', height: '10px', borderRadius: '5px', background: 'rgba(21,122,255,0.18)' }} />
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 52, 600) }}>
        <Text style={sectionTitleStyle}>快捷入口</Text>
        <View style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
          {quickActions.map((item) => (
            <Button key={item.label} style={quickActionStyle} onClick={item.action}>
              <Text style={{ display: 'block', fontWeight: '700', color: '#1A2D47' }}>{item.label}</Text>
              <Text style={{ display: 'block', marginTop: '6px', fontSize: '24px', color: '#708198' }}>{item.description}</Text>
            </Button>
          ))}
        </View>
      </View>

      <Button style={{ ...accentButtonStyle, marginBottom: '120px', opacity: loading ? '0.7' : '1' }} loading={loading} onClick={() => void login()}>
        {user ? '刷新登录态与首页数据' : '微信快捷登录'}
      </Button>
      </View>
    </ScrollView>
  );
}
