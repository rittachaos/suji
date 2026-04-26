import Taro, { useRouter } from '@tarojs/taro';
import { Button, Input, ScrollView, Text, Textarea, View } from '@tarojs/components';
import { useEffect, useMemo, useState } from 'react';
import { createStudentBodyRecord, createStudentTraining, fetchCoachStudentDetail } from '@/services/modules/coaches';
import { BodyRecordPayload, TrainingSessionPayload } from '@/types/api';

type StudentDetail = {
  student?: {
    id: string;
    nickname?: string;
    phone?: string;
    profile?: {
      heightCm?: number;
      trainingPhase?: string;
      note?: string;
    };
    goal?: {
      goalType?: string;
      targetWeightKg?: number;
      targetBodyFat?: number;
    };
  };
  bodyRecords?: BodyRecordPayload[];
  trainingSessions?: TrainingSessionPayload[];
};

const pageStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #F5F7FB 0%, #EEF2F8 48%, #E8EEF7 100%)',
};

const pageContentStyle = {
  padding: '28px 24px 120px',
};

const cardStyle = {
  background: 'rgba(255, 255, 255, 0.8)',
  borderRadius: '30px',
  padding: '24px',
  marginBottom: '18px',
  border: '1px solid rgba(255, 255, 255, 0.72)',
  boxShadow: '0 18px 42px rgba(124, 140, 171, 0.14)',
};

const inputStyle = {
  background: 'rgba(255, 255, 255, 0.94)',
  borderRadius: '20px',
  padding: '18px 20px',
  marginTop: '10px',
  border: '1px solid rgba(205, 217, 234, 0.84)',
};

const primaryButtonStyle = {
  background: 'linear-gradient(135deg, #157AFF 0%, #55A3FF 100%)',
  color: '#FFFFFF',
  borderRadius: '999px',
  marginTop: '16px',
  boxShadow: '0 12px 26px rgba(21, 122, 255, 0.22)',
};

const sectionTitleStyle = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#162033',
  letterSpacing: '-0.02em',
};

function parseNumber(value: string) {
  if (!value.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export default function CoachStudentDetailPage() {
  const router = useRouter();
  const studentId = router.params.studentId || '';
  const [entered, setEntered] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [bodyForm, setBodyForm] = useState<BodyRecordPayload>({
    recordDate: new Date().toISOString().slice(0, 10),
    note: '',
  });
  const [trainingForm, setTrainingForm] = useState<TrainingSessionPayload>({
    sessionDate: new Date().toISOString().slice(0, 10),
    bodyPart: '胸',
    note: '',
    exercises: [{ name: '卧推', equipment: '杠铃', bodyPart: '胸', sets: [{ setIndex: 1, weightKg: 60, reps: 8 }] }],
  });

  const loadDetail = async () => {
    if (!studentId) {
      return;
    }

    setLoading(true);
    try {
      const result = (await fetchCoachStudentDetail(studentId)) as StudentDetail;
      setDetail(result);
    } catch {
      Taro.showToast({ title: '学员详情加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDetail();
  }, [studentId]);

  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 40);
    return () => clearTimeout(timer);
  }, []);

  const latestBody = detail?.bodyRecords?.[0];
  const latestTraining = detail?.trainingSessions?.[0];

  const summaryText = useMemo(() => {
    if (!detail?.student) {
      return '正在加载学员详情';
    }

    return `${detail.student.profile?.trainingPhase || '未填写阶段'} · ${detail.student.goal?.goalType || '未设目标'}`;
  }, [detail]);

  const saveBody = async () => {
    setSaving(true);
    try {
      await createStudentBodyRecord(studentId, bodyForm);
      Taro.showToast({ title: '学员身体记录已保存', icon: 'success' });
      setBodyForm({ recordDate: new Date().toISOString().slice(0, 10), note: '' });
      await loadDetail();
    } catch {
      Taro.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      setSaving(false);
    }
  };

  const saveTraining = async () => {
    setSaving(true);
    try {
      await createStudentTraining(studentId, trainingForm);
      Taro.showToast({ title: '学员训练记录已保存', icon: 'success' });
      setTrainingForm({
        sessionDate: new Date().toISOString().slice(0, 10),
        bodyPart: '胸',
        note: '',
        exercises: [{ name: '卧推', equipment: '杠铃', bodyPart: '胸', sets: [{ setIndex: 1, weightKg: 60, reps: 8 }] }],
      });
      await loadDetail();
    } catch {
      Taro.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView scrollY style={pageStyle}>
      <View style={pageContentStyle}>
        <View style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(236,244,255,0.88) 58%, rgba(219,232,250,0.95) 100%)', transform: entered ? 'translateY(0)' : 'translateY(18px)', opacity: entered ? '1' : '0.01', transition: 'all 360ms ease' }}>
          <Text style={{ display: 'block', fontSize: '34px', fontWeight: '700', color: '#101828', letterSpacing: '-0.04em' }}>
            {detail?.student?.nickname || '学员详情 / 代录'}
          </Text>
          <Text style={{ display: 'block', marginTop: '8px', color: '#607086' }}>{summaryText}</Text>
          <Text style={{ display: 'block', marginTop: '8px', color: '#607086' }}>手机号：{detail?.student?.phone || '未绑定'}</Text>
          <Text style={{ display: 'block', marginTop: '8px', color: '#607086' }}>{detail?.student?.profile?.note || '暂无补充说明'}</Text>
        </View>

        <View style={{ ...cardStyle, transform: entered ? 'translateY(0)' : 'translateY(26px)', opacity: entered ? '1' : '0.01', transition: 'all 440ms ease' }}>
          <Text style={sectionTitleStyle}>最近概况</Text>
          <Text style={{ display: 'block', marginTop: '12px', color: '#607086' }}>
            最新身体：{latestBody ? `${latestBody.recordDate} · ${latestBody.weightKg || '-'} kg · ${latestBody.bodyFatRate || '-'}%` : '暂无身体记录'}
          </Text>
          <Text style={{ display: 'block', marginTop: '10px', color: '#607086' }}>
            最新训练：{latestTraining ? `${latestTraining.sessionDate} · ${latestTraining.bodyPart} · ${latestTraining.exercises?.[0]?.name || '未填动作'}` : '暂无训练记录'}
          </Text>
        </View>

        <View style={{ ...cardStyle, transform: entered ? 'translateY(0)' : 'translateY(34px)', opacity: entered ? '1' : '0.01', transition: 'all 520ms ease' }}>
          <Text style={sectionTitleStyle}>最近身体记录</Text>
          {detail?.bodyRecords?.length ? (
            detail.bodyRecords.map((item, index) => (
              <View key={`${item.recordDate}-${index}`} style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(218, 226, 239, 0.82)' }}>
                <Text style={{ color: '#162033' }}>{item.recordDate}</Text>
                <Text style={{ display: 'block', marginTop: '6px', color: '#607086' }}>
                  体重 {item.weightKg || '-'} kg · 体脂 {item.bodyFatRate || '-'}% · 腰围 {item.waistCm || '-'} cm
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ display: 'block', marginTop: '12px', color: '#8A94A6' }}>暂无身体记录。</Text>
          )}
        </View>

        <View style={{ ...cardStyle, transform: entered ? 'translateY(0)' : 'translateY(42px)', opacity: entered ? '1' : '0.01', transition: 'all 600ms ease' }}>
          <Text style={sectionTitleStyle}>最近训练记录</Text>
          {detail?.trainingSessions?.length ? (
            detail.trainingSessions.map((item, index) => (
              <View key={`${item.sessionDate}-${index}`} style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(218, 226, 239, 0.82)' }}>
                <Text style={{ color: '#162033' }}>{item.sessionDate} · {item.bodyPart}</Text>
                <Text style={{ display: 'block', marginTop: '6px', color: '#607086' }}>
                  {item.exercises?.[0]?.name || '未填写动作'} · {item.exercises?.[0]?.sets?.[0]?.weightKg || '-'} kg x {item.exercises?.[0]?.sets?.[0]?.reps || '-'}
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ display: 'block', marginTop: '12px', color: '#8A94A6' }}>暂无训练记录。</Text>
          )}
        </View>

        <View style={{ ...cardStyle, transform: entered ? 'translateY(0)' : 'translateY(50px)', opacity: entered ? '1' : '0.01', transition: 'all 680ms ease' }}>
          <Text style={sectionTitleStyle}>代录身体记录</Text>
          <Input style={inputStyle} value={bodyForm.recordDate} onInput={(e) => setBodyForm({ ...bodyForm, recordDate: e.detail.value })} placeholder='记录日期' />
          <Input style={inputStyle} type='digit' value={bodyForm.weightKg?.toString() || ''} onInput={(e) => setBodyForm({ ...bodyForm, weightKg: parseNumber(e.detail.value) })} placeholder='体重 kg' />
          <Input style={inputStyle} type='digit' value={bodyForm.bodyFatRate?.toString() || ''} onInput={(e) => setBodyForm({ ...bodyForm, bodyFatRate: parseNumber(e.detail.value) })} placeholder='体脂率 %' />
          <Textarea style={{ ...inputStyle, minHeight: '120px' }} value={bodyForm.note || ''} onInput={(e) => setBodyForm({ ...bodyForm, note: e.detail.value })} placeholder='代录备注' />
          <Button style={{ ...primaryButtonStyle, opacity: loading ? '0.7' : '1' }} loading={saving} onClick={() => void saveBody()}>
            保存身体记录
          </Button>
        </View>

        <View style={{ ...cardStyle, transform: entered ? 'translateY(0)' : 'translateY(58px)', opacity: entered ? '1' : '0.01', transition: 'all 760ms ease' }}>
          <Text style={sectionTitleStyle}>代录训练记录</Text>
          <Input style={inputStyle} value={trainingForm.sessionDate} onInput={(e) => setTrainingForm({ ...trainingForm, sessionDate: e.detail.value })} placeholder='训练日期' />
          <Input style={inputStyle} value={trainingForm.bodyPart} onInput={(e) => setTrainingForm({ ...trainingForm, bodyPart: e.detail.value })} placeholder='训练部位' />
          <Input
            style={inputStyle}
            value={trainingForm.exercises[0]?.name || ''}
            onInput={(e) => setTrainingForm({ ...trainingForm, exercises: [{ ...trainingForm.exercises[0], name: e.detail.value }] })}
            placeholder='动作名称'
          />
          <Input
            style={inputStyle}
            type='digit'
            value={trainingForm.exercises[0]?.sets[0]?.weightKg?.toString() || ''}
            onInput={(e) =>
              setTrainingForm({
                ...trainingForm,
                exercises: [{ ...trainingForm.exercises[0], sets: [{ ...trainingForm.exercises[0].sets[0], weightKg: parseNumber(e.detail.value) }] }],
              })
            }
            placeholder='重量 kg'
          />
          <Input
            style={inputStyle}
            type='number'
            value={trainingForm.exercises[0]?.sets[0]?.reps?.toString() || ''}
            onInput={(e) =>
              setTrainingForm({
                ...trainingForm,
                exercises: [{ ...trainingForm.exercises[0], sets: [{ ...trainingForm.exercises[0].sets[0], reps: parseNumber(e.detail.value) }] }],
              })
            }
            placeholder='次数 reps'
          />
          <Textarea style={{ ...inputStyle, minHeight: '120px' }} value={trainingForm.note || ''} onInput={(e) => setTrainingForm({ ...trainingForm, note: e.detail.value })} placeholder='代录训练备注' />
          <Button style={primaryButtonStyle} loading={saving} onClick={() => void saveTraining()}>
            保存训练记录
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
