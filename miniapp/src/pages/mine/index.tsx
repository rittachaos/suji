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

function scrollSelectorIntoView(selector: string, topMargin = 44) {
  const query = Taro.createSelectorQuery();

  query.selectViewport().scrollOffset();
  query.select(selector).boundingClientRect();
  query.exec((res) => {
    const viewport = res?.[0] as { scrollTop?: number } | undefined;
    const target = res?.[1] as { top?: number } | undefined;

    if (target?.top === undefined) {
      return;
    }

    const scrollTop = viewport?.scrollTop || 0;
    void Taro.pageScrollTo({
      scrollTop: Math.max(0, scrollTop + target.top - topMargin),
      duration: 280,
    });
  });
}

function scrollSelectorNearTop(selector: string, topMargin = 44) {
  const query = Taro.createSelectorQuery();

  query.selectViewport().scrollOffset();
  query.select(selector).boundingClientRect();
  query.exec((res) => {
    const viewport = res?.[0] as { scrollTop?: number } | undefined;
    const target = res?.[1] as { top?: number } | undefined;

    if (target?.top === undefined) {
      return;
    }

    const scrollTop = viewport?.scrollTop || 0;
    void Taro.pageScrollTo({
      scrollTop: Math.max(0, scrollTop + target.top - topMargin),
      duration: 280,
    });
  });
}

export default function MinePage() {
  const { user, bootstrap, logout } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [goalSaving, setGoalSaving] = useState(false);
  const [coachSaving, setCoachSaving] = useState(false);
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [nicknameOffset, setNicknameOffset] = useState(0);
  const [nicknameRevealRun, setNicknameRevealRun] = useState(0);
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [goalExpanded, setGoalExpanded] = useState(false);
  const [accountExpanded, setAccountExpanded] = useState(false);
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

  const nicknameText = user?.nickname || user?.id || '';
  const nicknameViewportWidth = 420;
  const nicknameTextWidth = useMemo(() => Math.max(nicknameViewportWidth, nicknameText.length * 26), [nicknameText]);
  const nicknameOverflow = useMemo(() => Math.max(0, nicknameTextWidth - nicknameViewportWidth + 36), [nicknameTextWidth]);

  useEffect(() => {
    setNicknameOffset(0);

    if (!nicknameOverflow || nicknameRevealRun === 0) {
      return;
    }

    let current = 0;
    let rafId = 0;
    let lastTimestamp = 0;
    let waitingUntil = 0;
    const speed = 18;
    const pauseAtStartMs = 900;
    const pauseAtEndMs = 1400;
    const maxTravel = nicknameOverflow;
    let phase: 'waiting' | 'forward' | 'hold-end' | 'backward' | 'done' = 'waiting';

    const animate = (timestamp: number) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
        waitingUntil = timestamp + pauseAtStartMs;
      }

      if (phase === 'waiting' && timestamp >= waitingUntil) {
        phase = 'forward';
      }

      if (phase === 'forward') {
        const delta = (timestamp - lastTimestamp) / 1000;
        current += speed * delta;

        if (current >= maxTravel) {
          current = maxTravel;
          phase = 'hold-end';
          waitingUntil = timestamp + pauseAtEndMs;
        }

        setNicknameOffset(-current);
      }

      if (phase === 'hold-end' && timestamp >= waitingUntil) {
        phase = 'backward';
      }

      if (phase === 'backward') {
        const delta = (timestamp - lastTimestamp) / 1000;
        current -= speed * delta;

        if (current <= 0) {
          current = 0;
          phase = 'done';
        }

        setNicknameOffset(-current);
      }

      lastTimestamp = timestamp;
      if (phase !== 'done') {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafId);
  }, [nicknameOverflow, nicknameRevealRun]);

  const saveProfile = async () => {
    if (!profileForm.nickname) {
      Taro.showToast({ title: '请先填写昵称', icon: 'none' });
      return;
    }

    setProfileSaving(true);
    try {
      await updateProfile(profileForm);
      await bootstrap();
      setProfileExpanded(false);
      scrollSelectorIntoView('#mine-profile-section');
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
      setGoalExpanded(false);
      scrollSelectorIntoView('#mine-goal-section');
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
      setAccountExpanded(false);
      scrollSelectorIntoView('#mine-account-section');
      Taro.showToast({ title: '手机号已绑定', icon: 'success' });
    } catch {
      Taro.showToast({ title: '手机号绑定失败', icon: 'none' });
    } finally {
      setPhoneSaving(false);
    }
  };

  const toggleProfileExpanded = () => {
    const next = !profileExpanded;
    setProfileExpanded(next);

    setTimeout(() => {
      scrollSelectorNearTop(next ? '#mine-profile-collapse-anchor' : '#mine-profile-section');
    }, 40);
  };

  const toggleGoalExpanded = () => {
    const next = !goalExpanded;
    setGoalExpanded(next);

    setTimeout(() => {
      scrollSelectorNearTop(next ? '#mine-goal-collapse-anchor' : '#mine-goal-section');
    }, 40);
  };

  const toggleAccountExpanded = () => {
    const next = !accountExpanded;
    setAccountExpanded(next);

    setTimeout(() => {
      scrollSelectorNearTop(next ? '#mine-account-collapse-anchor' : '#mine-account-section');
    }, 40);
  };

  if (!user) {
    return (
      <View style={{ padding: '32px' }}>
        <Text>登录之后，这里会成为你的个人训练空间。</Text>
      </View>
    );
  }

  return (
    <ScrollView scrollY style={pageStyle}>
      <View style={{ ...pageContentStyle, paddingBottom: '120px' }}>
      <View style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 18, 360), background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(243,248,255,0.96) 42%, rgba(226,236,249,0.96) 100%)', position: 'relative', overflow: 'hidden', padding: '18px 18px 16px' }}>
        <View style={{ position: 'absolute', top: '-70px', right: '-10px', width: '188px', height: '188px', borderRadius: '94px', background: 'radial-gradient(circle, rgba(21,122,255,0.18) 0%, rgba(21,122,255,0.06) 38%, rgba(21,122,255,0) 72%)' }} />
        <View style={{ position: 'absolute', left: '-42px', bottom: '-60px', width: '150px', height: '150px', borderRadius: '75px', background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 52%, rgba(255,255,255,0) 74%)' }} />
        <View style={{ position: 'relative', zIndex: 1 }}>
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ display: 'block', fontSize: '14px', letterSpacing: '0.24em', color: '#7A97BE' }}>PERSONAL HUB</Text>
            <View style={{ marginTop: '6px', width: `${nicknameViewportWidth}px`, overflow: 'hidden', position: 'relative' }} onClick={() => { if (nicknameOverflow > 0) { setNicknameRevealRun((prev) => prev + 1); } }}>
              {nicknameOverflow > 0 && (
                <>
                  <View style={{ position: 'absolute', left: '0', top: '0', bottom: '0', width: '28px', zIndex: 2, background: 'linear-gradient(90deg, rgba(243,248,255,0.98) 0%, rgba(243,248,255,0) 100%)' }} />
                  <View style={{ position: 'absolute', right: '0', top: '0', bottom: '0', width: '36px', zIndex: 2, background: 'linear-gradient(270deg, rgba(232,239,250,0.98) 0%, rgba(232,239,250,0) 100%)' }} />
                  <View style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', zIndex: 3, display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '999px', background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(255,255,255,0.82)', opacity: nicknameRevealRun === 0 ? '1' : '0', transition: 'opacity 260ms ease' }}>
                    <View style={{ width: '6px', height: '6px', borderTop: '1.5px solid #7A97BE', borderRight: '1.5px solid #7A97BE', transform: 'rotate(45deg)' }} />
                    <Text style={{ fontSize: '11px', color: '#7A97BE', letterSpacing: '0.08em' }}>点击展开</Text>
                  </View>
                </>
              )}
              <View style={{ display: 'flex', width: 'max-content', transform: `translateX(${nicknameOffset}px)`, transition: nicknameRevealRun === 0 ? 'none' : 'transform 80ms linear' }}>
                <Text
                  style={{
                    ...pageHeroTitleStyle,
                    display: 'block',
                    fontSize: '40px',
                    lineHeight: '1.02',
                    color: '#132033',
                    whiteSpace: 'nowrap',
                    textOverflow: nicknameRevealRun === 0 ? 'ellipsis' : 'clip',
                    overflow: 'hidden',
                  }}
                >
                  {nicknameText}
                </Text>
                {nicknameOverflow > 0 && nicknameRevealRun > 0 && (
                  <Text
                    style={{
                      ...pageHeroTitleStyle,
                      display: 'block',
                      fontSize: '40px',
                      lineHeight: '1.02',
                      color: '#132033',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {nicknameText}
                  </Text>
                )}
              </View>
            </View>
          </View>
          <View style={{ padding: '7px 11px', borderRadius: '999px', background: 'rgba(255,255,255,0.66)', border: '1px solid rgba(255,255,255,0.84)' }}>
            <Text style={{ color: '#4C78AE', fontSize: '15px', fontWeight: '600', letterSpacing: '0.1em' }}>{roleText}</Text>
          </View>
        </View>
        <Text style={{ ...pageHeroSubtitleStyle, marginTop: '8px', color: '#5B6B83', lineHeight: '1.6', fontSize: '18px', maxWidth: '560px' }}>
          {user.role === 'COACH' || user.role === 'ADMIN'
            ? `你当前可管理 ${studentCount} 位学员，把自己的节奏与陪伴他人的进展放在同一条视线上。`
            : '把资料、目标与账号信息整理清晰，你的训练旅程就会更完整、更有方向。'}
        </Text>
        <View style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <View style={{ flex: 1, padding: '16px', borderRadius: '22px', background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(255,255,255,0.82)' }}>
            <Text style={{ color: '#6F88A8', fontSize: '20px' }}>阶段</Text>
            <Text style={{ ...metricValueLargeStyle, marginTop: '6px', fontSize: '24px', color: '#162033' }}>{profileForm.trainingPhase || '等待定义'}</Text>
          </View>
          <View style={{ flex: 1, padding: '16px', borderRadius: '22px', background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(255,255,255,0.82)' }}>
            <Text style={{ color: '#6F88A8', fontSize: '20px' }}>目标</Text>
            <Text style={{ ...metricValueLargeStyle, marginTop: '6px', fontSize: '24px', color: '#162033' }}>{goalForm.goalType}</Text>
          </View>
        </View>
        </View>
      </View>

      <View id='mine-profile-section' style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 26, 440) }}>
        <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <Text style={sectionEyebrowStyle}>PROFILE</Text>
            <Text style={sectionHeadingStyle}>个人资料</Text>
          </View>
          <View style={sectionMetaWrapStyle}>
            <View style={sectionMetaLineStyle} />
            <Text style={sectionMetaTextStyle}>EDIT</Text>
          </View>
        </View>
        <Text style={{ display: 'block', marginTop: '10px', color: '#7A8598' }}>{profileForm.nickname ? `当前昵称 ${profileForm.nickname}` : '先补齐资料，你的个人空间会更完整。'}</Text>
        {!profileExpanded && <Button style={primaryButton} loading={profileSaving || loading} onClick={toggleProfileExpanded}>编辑个人资料</Button>}
        {profileExpanded && (
          <>
        <Button id='mine-profile-collapse-anchor' style={secondaryButton} loading={profileSaving || loading} onClick={toggleProfileExpanded}>收起资料编辑</Button>
        <Input id='mine-profile-first-field' style={inputStyle} value={profileForm.nickname} onInput={(e) => setProfileForm({ ...profileForm, nickname: e.detail.value })} placeholder='昵称' />
        <Picker mode='selector' range={genderLabels} onChange={(e) => setProfileForm({ ...profileForm, gender: genderOptions[Number(e.detail.value)] })}>
          <View style={inputStyle}><Text>{profileForm.gender ? genderLabels[genderOptions.indexOf(profileForm.gender)] : '选择性别'}</Text></View>
        </Picker>
        <Input style={inputStyle} type='number' value={profileForm.age?.toString() || ''} onInput={(e) => setProfileForm({ ...profileForm, age: parseNumber(e.detail.value) })} placeholder='年龄' />
        <Input style={inputStyle} type='digit' value={profileForm.heightCm?.toString() || ''} onInput={(e) => setProfileForm({ ...profileForm, heightCm: parseNumber(e.detail.value) })} placeholder='身高 cm' />
        <Picker mode='selector' range={phaseLabels} onChange={(e) => setProfileForm({ ...profileForm, trainingPhase: phaseOptions[Number(e.detail.value)] })}>
          <View style={inputStyle}><Text>{profileForm.trainingPhase ? phaseLabels[phaseOptions.indexOf(profileForm.trainingPhase)] : '选择训练阶段'}</Text></View>
        </Picker>
        <Textarea style={{ ...inputStyle, minHeight: '120px' }} value={profileForm.note || ''} onInput={(e) => setProfileForm({ ...profileForm, note: e.detail.value })} placeholder='个人备注、训练习惯、伤病说明' />
        <Button style={primaryButton} loading={profileSaving || loading} onClick={() => void saveProfile()}>保存资料</Button>
          </>
        )}
      </View>

      <View id='mine-goal-section' style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 34, 520) }}>
        <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <Text style={sectionEyebrowStyle}>GOAL SETTING</Text>
            <Text style={sectionHeadingStyle}>目标设定</Text>
          </View>
          <View style={sectionMetaWrapStyle}>
            <View style={sectionMetaLineStyle} />
            <Text style={sectionMetaTextStyle}>PLAN</Text>
          </View>
        </View>
        <Text style={{ display: 'block', marginTop: '10px', color: '#7A8598' }}>{goalForm.goalType ? `当前方向 ${goalLabels[goalOptions.indexOf(goalForm.goalType)]}` : '先定义目标，训练会更有方向感。'}</Text>
        {!goalExpanded && <Button style={primaryButton} loading={goalSaving || loading} onClick={toggleGoalExpanded}>编辑目标设定</Button>}
        {goalExpanded && (
          <>
        <Button id='mine-goal-collapse-anchor' style={secondaryButton} loading={goalSaving || loading} onClick={toggleGoalExpanded}>收起目标编辑</Button>
        <Picker mode='selector' range={goalLabels} onChange={(e) => setGoalForm({ ...goalForm, goalType: goalOptions[Number(e.detail.value)] })}>
          <View id='mine-goal-first-field' style={inputStyle}><Text>{goalLabels[goalOptions.indexOf(goalForm.goalType)]}</Text></View>
        </Picker>
        <Input style={inputStyle} type='digit' value={goalForm.targetWeightKg?.toString() || ''} onInput={(e) => setGoalForm({ ...goalForm, targetWeightKg: parseNumber(e.detail.value) })} placeholder='目标体重 kg' />
        <Input style={inputStyle} type='digit' value={goalForm.targetBodyFat?.toString() || ''} onInput={(e) => setGoalForm({ ...goalForm, targetBodyFat: parseNumber(e.detail.value) })} placeholder='目标体脂 %' />
        <Input style={inputStyle} type='digit' value={goalForm.targetWaistCm?.toString() || ''} onInput={(e) => setGoalForm({ ...goalForm, targetWaistCm: parseNumber(e.detail.value) })} placeholder='目标腰围 cm' />
        <Input style={inputStyle} type='number' value={goalForm.targetCycleDays?.toString() || ''} onInput={(e) => setGoalForm({ ...goalForm, targetCycleDays: parseNumber(e.detail.value) })} placeholder='目标周期 天' />
        <Button style={primaryButton} loading={goalSaving || loading} onClick={() => void saveGoal()}>保存目标</Button>
          </>
        )}
      </View>

      <View id='mine-account-section' style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 42, 600) }}>
        <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <Text style={sectionEyebrowStyle}>ACCOUNT & ROLE</Text>
            <Text style={sectionHeadingStyle}>账号与角色</Text>
          </View>
          <View style={sectionMetaWrapStyle}>
            <View style={sectionMetaLineStyle} />
            <Text style={sectionMetaTextStyle}>ACCESS</Text>
          </View>
        </View>
        <Text style={{ display: 'block', marginTop: '8px', color: '#607086' }}>{phone ? `当前已绑定手机号 ${phone}` : '把账号与身份信息整理清楚，后面的体验会更完整顺手。'}</Text>
        {!accountExpanded && <Button style={secondaryButton} loading={phoneSaving} onClick={toggleAccountExpanded}>查看账号设置</Button>}
        {accountExpanded && (
          <>
            <Button id='mine-account-collapse-anchor' style={secondaryButton} loading={phoneSaving} onClick={toggleAccountExpanded}>收起账号设置</Button>
            <Input id='mine-account-first-field' style={inputStyle} type='number' value={phone} onInput={(e) => setPhone(e.detail.value)} placeholder='输入手机号' />
            <Button style={secondaryButton} loading={phoneSaving} onClick={() => void savePhone()}>完成绑定</Button>
            {user.role === 'USER' ? (
              <>
                <Textarea style={{ ...inputStyle, minHeight: '120px' }} value={coachReason} onInput={(e) => setCoachReason(e.detail.value)} placeholder='写下你的教练申请理由' />
                <Button style={primaryButton} loading={coachSaving} onClick={() => void submitCoachApplication()}>提交申请</Button>
              </>
            ) : (
              <>
                <Button style={secondaryButton} onClick={() => Taro.navigateTo({ url: '/pages/coach/students/index' })}>查看学员</Button>
                <Button style={secondaryButton} onClick={() => Taro.navigateTo({ url: '/pages/coach/students/index?mode=entry' })}>进入代录</Button>
                {user.role === 'ADMIN' && <Button style={secondaryButton} onClick={() => Taro.navigateTo({ url: '/pages/admin/index' })}>查看管理台</Button>}
              </>
            )}
            <Button style={{ ...secondaryButton, background: 'rgba(246, 248, 252, 0.96)' }} onClick={() => logout()}>退出当前账号</Button>
          </>
        )}
      </View>
      </View>
    </ScrollView>
  );
}
