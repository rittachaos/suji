import Taro from '@tarojs/taro';
import { Button, Input, Picker, ScrollView, Text, Textarea, View } from '@tarojs/components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { bindPhone } from '@/services/modules/auth';
import { createCoachApplication, fetchCoachStudents } from '@/services/modules/coaches';
import { fetchGoal, fetchProfile, updateGoal, updateProfile } from '@/services/modules/users';
import { useUserStore } from '@/store/user';
import {
  createEnterStyle,
  createGlassCardStyle,
  createInputStyle,
  createPageContentStyle,
  createPressableCardStyle,
  createPrimaryButtonStyle,
  createSecondaryButtonStyle,
  metricValueLargeStyle,
  pageHeroSubtitleStyle,
  pageHeroTitleStyle,
  sectionTitleStyle,
  tokens,
} from '@/utils/design';

type ProfileForm = {
  nickname: string;
  gender?: string;
  age?: number;
  heightCm?: number;
  trainingPhase?: string;
  note?: string;
};

type GoalForm = {
  goalType: string;
  targetWeightKg?: number;
  targetBodyFat?: number;
  targetWaistCm?: number;
  targetCycleDays?: number;
  startDate?: string;
  endDate?: string;
};

const phaseOptions = ['BEGINNER', 'BUILDING', 'CUTTING', 'RECOMP', 'MAINTAINING'];
const phaseLabels = ['新手适应', '增肌期', '减脂期', '重组期', '维持期'];
const genderOptions = ['MALE', 'FEMALE', 'OTHER'];
const genderLabels = ['男', '女', '其他'];
const goalOptions = ['FAT_LOSS', 'MUSCLE_GAIN', 'SHAPING', 'STRENGTH', 'MAINTAIN'];
const goalLabels = ['减脂', '增肌', '塑形', '力量提升', '维持'];

const pageStyle = {
  minHeight: '100vh',
  background: tokens.pageBackground,
};

const pageContentStyle = createPageContentStyle();

const cardStyle = createGlassCardStyle();

const inputStyle = createInputStyle();

const primaryButton = {
  ...createPrimaryButtonStyle(),
  marginTop: '18px',
};

const secondaryButton = {
  ...createSecondaryButtonStyle(),
  marginTop: '12px',
};

function parseNumber(value: string) {
  if (!value.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export default function MinePage() {
  const { user, bootstrap, logout } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [goalSaving, setGoalSaving] = useState(false);
  const [coachSaving, setCoachSaving] = useState(false);
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [studentCount, setStudentCount] = useState(0);
  const [entered, setEntered] = useState(false);
  const [phone, setPhone] = useState('');
  const [coachReason, setCoachReason] = useState('我有持续训练经验，希望帮助学员一起记录和复盘训练数据。');
  const [profileForm, setProfileForm] = useState<ProfileForm>({ nickname: '', note: '' });
  const [goalForm, setGoalForm] = useState<GoalForm>({ goalType: 'FAT_LOSS' });

  const loadPageData = useCallback(async () => {
    if (!user) {
      return;
    }

    setLoading(true);
    try {
      const requests = [fetchProfile(), fetchGoal()];
      if (user.role === 'COACH' || user.role === 'ADMIN') {
        requests.push(fetchCoachStudents() as never);
      }
      const [profileRes, goalRes, studentsRes] = (await Promise.all(requests)) as [
        Record<string, unknown>,
        Record<string, unknown> | null,
        unknown[] | undefined,
      ];

      setProfileForm({
        nickname: (profileRes.nickname as string) || '',
        gender: (profileRes.profile as Record<string, unknown> | undefined)?.gender as string | undefined,
        age: (profileRes.profile as Record<string, unknown> | undefined)?.age as number | undefined,
        heightCm: (profileRes.profile as Record<string, unknown> | undefined)?.heightCm as number | undefined,
        trainingPhase: (profileRes.profile as Record<string, unknown> | undefined)?.trainingPhase as string | undefined,
        note: ((profileRes.profile as Record<string, unknown> | undefined)?.note as string) || '',
      });

      setGoalForm({
        goalType: (goalRes?.goalType as string) || 'FAT_LOSS',
        targetWeightKg: goalRes?.targetWeightKg as number | undefined,
        targetBodyFat: goalRes?.targetBodyFat as number | undefined,
        targetWaistCm: goalRes?.targetWaistCm as number | undefined,
        targetCycleDays: goalRes?.targetCycleDays as number | undefined,
        startDate: goalRes?.startDate as string | undefined,
        endDate: goalRes?.endDate as string | undefined,
      });

      setPhone((profileRes.phone as string) || user.phone || '');
      setStudentCount(Array.isArray(studentsRes) ? studentsRes.length : 0);
    } catch {
      Taro.showToast({ title: '我的页数据加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadPageData();
  }, [loadPageData]);

  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 40);
    return () => clearTimeout(timer);
  }, []);

  const roleText = useMemo(() => {
    if (!user) {
      return '未登录';
    }
    if (user.role === 'ADMIN') {
      return '管理员';
    }
    if (user.role === 'COACH') {
      return '教练';
    }
    return '普通用户';
  }, [user]);

  const saveProfile = async () => {
    if (!profileForm.nickname) {
      Taro.showToast({ title: '请先填写昵称', icon: 'none' });
      return;
    }

    setProfileSaving(true);
    try {
      await updateProfile(profileForm);
      await bootstrap();
      await loadPageData();
      Taro.showToast({ title: '资料已保存', icon: 'success' });
    } catch {
      Taro.showToast({ title: '资料保存失败', icon: 'none' });
    } finally {
      setProfileSaving(false);
    }
  };

  const saveGoal = async () => {
    setGoalSaving(true);
    try {
      await updateGoal(goalForm);
      await loadPageData();
      Taro.showToast({ title: '目标已保存', icon: 'success' });
    } catch {
      Taro.showToast({ title: '目标保存失败', icon: 'none' });
    } finally {
      setGoalSaving(false);
    }
  };

  const submitCoachApplication = async () => {
    if (coachReason.trim().length < 10) {
      Taro.showToast({ title: '申请理由至少 10 个字', icon: 'none' });
      return;
    }

    setCoachSaving(true);
    try {
      await createCoachApplication(coachReason);
      Taro.showToast({ title: '教练申请已提交', icon: 'success' });
    } catch {
      Taro.showToast({ title: '教练申请失败', icon: 'none' });
    } finally {
      setCoachSaving(false);
    }
  };

  const savePhone = async () => {
    if (phone.length !== 11) {
      Taro.showToast({ title: '请输入 11 位手机号', icon: 'none' });
      return;
    }

    setPhoneSaving(true);
    try {
      await bindPhone(phone);
      await bootstrap();
      Taro.showToast({ title: '手机号已绑定', icon: 'success' });
    } catch {
      Taro.showToast({ title: '手机号绑定失败', icon: 'none' });
    } finally {
      setPhoneSaving(false);
    }
  };

  if (!user) {
    return (
      <View style={{ padding: '32px' }}>
        <Text>请先登录后再查看“我的”。</Text>
      </View>
    );
  }

  return (
    <ScrollView scrollY style={pageStyle}>
      <View style={{ ...pageContentStyle, paddingBottom: '120px' }}>
      <View style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 18, 360), background: tokens.heroBackground }}>
        <Text style={pageHeroTitleStyle}>{user.nickname || user.id}</Text>
        <Text style={pageHeroSubtitleStyle}>当前角色：{roleText}</Text>
        <Text style={{ ...pageHeroSubtitleStyle, marginTop: '8px' }}>
          {user.role === 'COACH' || user.role === 'ADMIN' ? `当前可管理学员 ${studentCount} 人` : '补齐资料、目标和绑定信息后，主链路就更完整了。'}
        </Text>
        <View style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <View style={{ flex: 1, padding: '16px', borderRadius: '22px', background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(255,255,255,0.82)' }}>
            <Text style={{ color: '#6F88A8', fontSize: '20px' }}>阶段</Text>
            <Text style={{ ...metricValueLargeStyle, marginTop: '6px', fontSize: '24px', color: '#162033' }}>{profileForm.trainingPhase || '未设置'}</Text>
          </View>
          <View style={{ flex: 1, padding: '16px', borderRadius: '22px', background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(255,255,255,0.82)' }}>
            <Text style={{ color: '#6F88A8', fontSize: '20px' }}>目标</Text>
            <Text style={{ ...metricValueLargeStyle, marginTop: '6px', fontSize: '24px', color: '#162033' }}>{goalForm.goalType}</Text>
          </View>
        </View>
      </View>

      <View style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 26, 440) }}>
        <Text style={sectionTitleStyle}>个人资料</Text>
        <Input style={inputStyle} value={profileForm.nickname} onInput={(e) => setProfileForm({ ...profileForm, nickname: e.detail.value })} placeholder='昵称' />
        <Picker mode='selector' range={genderLabels} onChange={(e) => setProfileForm({ ...profileForm, gender: genderOptions[Number(e.detail.value)] })}>
          <View style={inputStyle}><Text>{profileForm.gender ? genderLabels[genderOptions.indexOf(profileForm.gender)] : '选择性别'}</Text></View>
        </Picker>
        <Input style={inputStyle} type='number' value={profileForm.age?.toString() || ''} onInput={(e) => setProfileForm({ ...profileForm, age: parseNumber(e.detail.value) })} placeholder='年龄' />
        <Input style={inputStyle} type='digit' value={profileForm.heightCm?.toString() || ''} onInput={(e) => setProfileForm({ ...profileForm, heightCm: parseNumber(e.detail.value) })} placeholder='身高 cm' />
        <Picker mode='selector' range={phaseLabels} onChange={(e) => setProfileForm({ ...profileForm, trainingPhase: phaseOptions[Number(e.detail.value)] })}>
          <View style={inputStyle}><Text>{profileForm.trainingPhase ? phaseLabels[phaseOptions.indexOf(profileForm.trainingPhase)] : '选择训练阶段'}</Text></View>
        </Picker>
        <Textarea style={{ ...inputStyle, minHeight: '120px' }} value={profileForm.note || ''} onInput={(e) => setProfileForm({ ...profileForm, note: e.detail.value })} placeholder='个人备注、训练习惯、伤病说明' />
        <Button style={primaryButton} loading={profileSaving || loading} onClick={() => void saveProfile()}>保存个人资料</Button>
      </View>

      <View style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 34, 520) }}>
        <Text style={sectionTitleStyle}>目标设定</Text>
        <Picker mode='selector' range={goalLabels} onChange={(e) => setGoalForm({ ...goalForm, goalType: goalOptions[Number(e.detail.value)] })}>
          <View style={inputStyle}><Text>{goalLabels[goalOptions.indexOf(goalForm.goalType)]}</Text></View>
        </Picker>
        <Input style={inputStyle} type='digit' value={goalForm.targetWeightKg?.toString() || ''} onInput={(e) => setGoalForm({ ...goalForm, targetWeightKg: parseNumber(e.detail.value) })} placeholder='目标体重 kg' />
        <Input style={inputStyle} type='digit' value={goalForm.targetBodyFat?.toString() || ''} onInput={(e) => setGoalForm({ ...goalForm, targetBodyFat: parseNumber(e.detail.value) })} placeholder='目标体脂 %' />
        <Input style={inputStyle} type='digit' value={goalForm.targetWaistCm?.toString() || ''} onInput={(e) => setGoalForm({ ...goalForm, targetWaistCm: parseNumber(e.detail.value) })} placeholder='目标腰围 cm' />
        <Input style={inputStyle} type='number' value={goalForm.targetCycleDays?.toString() || ''} onInput={(e) => setGoalForm({ ...goalForm, targetCycleDays: parseNumber(e.detail.value) })} placeholder='目标周期 天' />
        <Button style={primaryButton} loading={goalSaving || loading} onClick={() => void saveGoal()}>保存目标设定</Button>
      </View>

      <View style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 42, 600) }}>
        <Text style={sectionTitleStyle}>账号与角色</Text>
        <Text style={{ display: 'block', marginTop: '8px', color: '#607086' }}>当前测试将直接走真实接口链路，请先确保本地服务可用。</Text>
        <Input style={inputStyle} type='number' value={phone} onInput={(e) => setPhone(e.detail.value)} placeholder='绑定手机号' />
        <Button style={secondaryButton} loading={phoneSaving} onClick={() => void savePhone()}>绑定手机号</Button>
        {user.role === 'USER' ? (
          <>
            <Textarea style={{ ...inputStyle, minHeight: '120px' }} value={coachReason} onInput={(e) => setCoachReason(e.detail.value)} placeholder='填写教练申请理由' />
            <Button style={primaryButton} loading={coachSaving} onClick={() => void submitCoachApplication()}>申请成为教练</Button>
          </>
        ) : (
          <>
            <Button style={secondaryButton} onClick={() => Taro.navigateTo({ url: '/pages/coach/students/index' })}>查看学员列表</Button>
            <Button style={secondaryButton} onClick={() => Taro.navigateTo({ url: '/pages/coach/students/index?mode=entry' })}>进入教练代录</Button>
            {user.role === 'ADMIN' && <Button style={secondaryButton} onClick={() => Taro.navigateTo({ url: '/pages/admin/index' })}>进入管理台</Button>}
          </>
        )}
        <Button style={{ ...secondaryButton, background: 'rgba(246, 248, 252, 0.96)' }} onClick={() => logout()}>退出登录</Button>
      </View>
      </View>
    </ScrollView>
  );
}
