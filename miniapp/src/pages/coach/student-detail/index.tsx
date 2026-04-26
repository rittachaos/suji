import Taro, { useRouter } from '@tarojs/taro';
import { Button, Input, Picker, ScrollView, Text, Textarea, View } from '@tarojs/components';
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

type ExerciseDraftConfig = {
  workingWeightKg?: number;
  topWeightKg?: number;
  setCount: number;
  durationMinutes?: number;
};

const bodyPartOptions = ['胸', '背', '肩', '腿', '手臂', '核心', '全身', '有氧'];
const weightOptions = Array.from({ length: 129 }, (_, index) => `${index * 2.5}`);
const setCountOptions = ['1', '2', '3', '4', '5', '6', '7', '8'];
const durationMinuteOptions = ['10', '15', '20', '30', '40', '45', '60', '75', '90'];
const exerciseCatalog = [
  { name: '卧推', equipment: '杠铃', bodyPart: '胸' },
  { name: '上斜卧推', equipment: '哑铃', bodyPart: '胸' },
  { name: '绳索夹胸', equipment: '绳索', bodyPart: '胸' },
  { name: '高位下拉', equipment: '器械', bodyPart: '背' },
  { name: '杠铃划船', equipment: '杠铃', bodyPart: '背' },
  { name: '坐姿划船', equipment: '器械', bodyPart: '背' },
  { name: '肩上推举', equipment: '杠铃', bodyPart: '肩' },
  { name: '侧平举', equipment: '哑铃', bodyPart: '肩' },
  { name: '深蹲', equipment: '杠铃', bodyPart: '腿' },
  { name: '腿举', equipment: '器械', bodyPart: '腿' },
  { name: '罗马尼亚硬拉', equipment: '杠铃', bodyPart: '腿' },
  { name: '二头弯举', equipment: '哑铃', bodyPart: '手臂' },
  { name: '绳索下压', equipment: '绳索', bodyPart: '手臂' },
  { name: '平板支撑', equipment: '自重', bodyPart: '核心' },
  { name: '跑步', equipment: '跑步机', bodyPart: '有氧' },
];

const exerciseNames = exerciseCatalog.map((item) => item.name);

function createWeightOptions(equipment?: string) {
  const ranges: Record<string, { max: number; step: number }> = {
    杠铃: { max: 320, step: 2.5 },
    哑铃: { max: 80, step: 2.5 },
    器械: { max: 200, step: 2.5 },
    绳索: { max: 120, step: 2.5 },
    壶铃: { max: 80, step: 2.5 },
    自重: { max: 60, step: 2.5 },
  };
  const config = equipment ? ranges[equipment] : undefined;
  const max = config?.max ?? 200;
  const step = config?.step ?? 2.5;
  return Array.from({ length: Math.floor(max / step) + 1 }, (_, index) => `${Number((index * step).toFixed(1))}`);
}

function createDefaultExerciseDraft(): ExerciseDraftConfig {
  return { workingWeightKg: undefined, topWeightKg: undefined, setCount: 3, durationMinutes: undefined };
}

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

const historyItemStyle = {
  marginTop: '14px',
  padding: '16px 18px',
  borderRadius: '22px',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(246,250,255,0.94) 100%)',
  border: '1px solid rgba(213, 221, 232, 0.76)',
  boxShadow: '0 8px 18px rgba(125, 142, 168, 0.06), inset 0 1px 0 rgba(255,255,255,0.92)',
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
  const [trainingDraft, setTrainingDraft] = useState<ExerciseDraftConfig>(createDefaultExerciseDraft());

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
      const exercise = trainingForm.exercises[0];
      const isCardio = trainingForm.bodyPart === '有氧';
      const payload: TrainingSessionPayload = {
        ...trainingForm,
        exercises: [
          {
            ...exercise,
            exerciseType: isCardio ? 'CARDIO' : 'STRENGTH',
            workingWeightKg: isCardio ? undefined : trainingDraft.workingWeightKg,
            topWeightKg: isCardio ? undefined : trainingDraft.topWeightKg,
            setCount: isCardio ? undefined : trainingDraft.setCount,
            durationMinutes: isCardio ? trainingDraft.durationMinutes : undefined,
            sets: [],
          },
        ],
      };
      await createStudentTraining(studentId, payload);
      Taro.showToast({ title: '学员训练记录已保存', icon: 'success' });
      setTrainingForm({
        sessionDate: new Date().toISOString().slice(0, 10),
        bodyPart: '胸',
        note: '',
        exercises: [{ name: '卧推', equipment: '杠铃', bodyPart: '胸', sets: [{ setIndex: 1, weightKg: 60, reps: 8 }] }],
      });
      setTrainingDraft(createDefaultExerciseDraft());
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
        <View style={{ ...cardStyle, background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(243,248,255,0.96) 42%, rgba(226,236,249,0.96) 100%)', position: 'relative', overflow: 'hidden', padding: '18px 18px 16px', transform: entered ? 'translateY(0)' : 'translateY(18px)', opacity: entered ? '1' : '0.01', transition: 'all 360ms ease' }}>
          <View style={{ position: 'absolute', top: '-70px', right: '-10px', width: '188px', height: '188px', borderRadius: '94px', background: 'radial-gradient(circle, rgba(21,122,255,0.18) 0%, rgba(21,122,255,0.06) 38%, rgba(21,122,255,0) 72%)' }} />
          <View style={{ position: 'absolute', left: '-42px', bottom: '-60px', width: '150px', height: '150px', borderRadius: '75px', background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 52%, rgba(255,255,255,0) 74%)' }} />
          <View style={{ position: 'relative', zIndex: 1 }}>
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ display: 'block', fontSize: '14px', letterSpacing: '0.24em', color: '#7A97BE' }}>STUDENT PROFILE</Text>
                <Text style={{ display: 'block', marginTop: '6px', fontSize: '40px', fontWeight: '700', color: '#101828', letterSpacing: '-0.04em', lineHeight: '1.02' }}>
                  {detail?.student?.nickname || '学员详情 / 代录'}
                </Text>
              </View>
              <View style={{ padding: '7px 11px', borderRadius: '999px', background: 'rgba(255,255,255,0.66)', border: '1px solid rgba(255,255,255,0.84)' }}>
                <Text style={{ color: '#4C78AE', fontSize: '15px', fontWeight: '600', letterSpacing: '0.1em' }}>COACH VIEW</Text>
              </View>
            </View>
            <Text style={{ display: 'block', marginTop: '8px', color: '#5B6B83', lineHeight: '1.6', fontSize: '18px', maxWidth: '560px' }}>{summaryText}</Text>
            <Text style={{ display: 'block', marginTop: '8px', color: '#607086' }}>手机号：{detail?.student?.phone || '未绑定'}</Text>
            <Text style={{ display: 'block', marginTop: '8px', color: '#607086' }}>{detail?.student?.profile?.note || '暂无补充说明'}</Text>
          </View>
        </View>

        <View style={{ ...cardStyle, transform: entered ? 'translateY(0)' : 'translateY(26px)', opacity: entered ? '1' : '0.01', transition: 'all 440ms ease', padding: '16px 16px 14px' }}>
          <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <View>
              <Text style={sectionEyebrowStyle}>SNAPSHOT</Text>
              <Text style={sectionHeadingStyle}>最近概况</Text>
            </View>
            <View style={sectionMetaWrapStyle}>
              <View style={sectionMetaLineStyle} />
              <Text style={sectionMetaTextStyle}>LIVE</Text>
            </View>
          </View>
          <Text style={{ display: 'block', marginTop: '12px', color: '#607086' }}>
            最新身体：{latestBody ? `${latestBody.recordDate} · ${latestBody.weightKg || '-'} kg · ${latestBody.bodyFatRate || '-'}%` : '暂无身体记录'}
          </Text>
          <Text style={{ display: 'block', marginTop: '10px', color: '#607086' }}>
            最新训练：{latestTraining ? `${latestTraining.sessionDate} · ${latestTraining.bodyPart} · ${latestTraining.exercises?.[0]?.name || '未填动作'}` : '暂无训练记录'}
          </Text>
        </View>

        <View style={{ ...cardStyle, transform: entered ? 'translateY(0)' : 'translateY(34px)', opacity: entered ? '1' : '0.01', transition: 'all 520ms ease', padding: '16px 16px 14px' }}>
          <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <View>
              <Text style={sectionEyebrowStyle}>RECENT BODY</Text>
              <Text style={sectionHeadingStyle}>最近身体记录</Text>
            </View>
            <View style={sectionMetaWrapStyle}>
              <View style={sectionMetaLineStyle} />
              <Text style={sectionMetaTextStyle}>HISTORY</Text>
            </View>
          </View>
          {detail?.bodyRecords?.length ? (
            detail.bodyRecords.map((item, index) => (
              <View key={`${item.recordDate}-${index}`} style={historyItemStyle}>
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

        <View style={{ ...cardStyle, transform: entered ? 'translateY(0)' : 'translateY(42px)', opacity: entered ? '1' : '0.01', transition: 'all 600ms ease', padding: '16px 16px 14px' }}>
          <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <View>
              <Text style={sectionEyebrowStyle}>RECENT SESSION</Text>
              <Text style={sectionHeadingStyle}>最近训练记录</Text>
            </View>
            <View style={sectionMetaWrapStyle}>
              <View style={sectionMetaLineStyle} />
              <Text style={sectionMetaTextStyle}>HISTORY</Text>
            </View>
          </View>
          {detail?.trainingSessions?.length ? (
            detail.trainingSessions.map((item, index) => (
              <View key={`${item.sessionDate}-${index}`} style={historyItemStyle}>
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
          <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <View>
              <Text style={sectionEyebrowStyle}>BODY ENTRY</Text>
              <Text style={sectionHeadingStyle}>代录身体记录</Text>
            </View>
            <View style={sectionMetaWrapStyle}>
              <View style={sectionMetaLineStyle} />
              <Text style={sectionMetaTextStyle}>COACH</Text>
            </View>
          </View>
          <Input style={inputStyle} value={bodyForm.recordDate} onInput={(e) => setBodyForm({ ...bodyForm, recordDate: e.detail.value })} placeholder='记录日期' />
          <Input style={inputStyle} type='digit' value={bodyForm.weightKg?.toString() || ''} onInput={(e) => setBodyForm({ ...bodyForm, weightKg: parseNumber(e.detail.value) })} placeholder='体重 kg' />
          <Input style={inputStyle} type='digit' value={bodyForm.bodyFatRate?.toString() || ''} onInput={(e) => setBodyForm({ ...bodyForm, bodyFatRate: parseNumber(e.detail.value) })} placeholder='体脂率 %' />
          <Textarea style={{ ...inputStyle, minHeight: '120px' }} value={bodyForm.note || ''} onInput={(e) => setBodyForm({ ...bodyForm, note: e.detail.value })} placeholder='代录备注' />
          <Button style={{ ...primaryButtonStyle, opacity: loading ? '0.7' : '1' }} loading={saving} onClick={() => void saveBody()}>
            保存身体记录
          </Button>
        </View>

        <View style={{ ...cardStyle, transform: entered ? 'translateY(0)' : 'translateY(58px)', opacity: entered ? '1' : '0.01', transition: 'all 760ms ease' }}>
          <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <View>
              <Text style={sectionEyebrowStyle}>SESSION ENTRY</Text>
              <Text style={sectionHeadingStyle}>代录训练记录</Text>
            </View>
            <View style={sectionMetaWrapStyle}>
              <View style={sectionMetaLineStyle} />
              <Text style={sectionMetaTextStyle}>COACH</Text>
            </View>
          </View>
          <Input style={inputStyle} value={trainingForm.sessionDate} onInput={(e) => setTrainingForm({ ...trainingForm, sessionDate: e.detail.value })} placeholder='训练日期' />
          <Picker mode='selector' range={bodyPartOptions} onChange={(e) => setTrainingForm({ ...trainingForm, bodyPart: bodyPartOptions[Number(e.detail.value)] })}>
            <View style={inputStyle}><Text>{trainingForm.bodyPart || '选择训练部位'}</Text></View>
          </Picker>
          <Picker
            mode='selector'
            range={exerciseNames.sort((a, b) => {
              const aItem = exerciseCatalog.find((item) => item.name === a);
              const bItem = exerciseCatalog.find((item) => item.name === b);
              return (aItem?.bodyPart === trainingForm.bodyPart ? 0 : 1) - (bItem?.bodyPart === trainingForm.bodyPart ? 0 : 1);
            })}
            onChange={(e) => {
              const options = exerciseNames.sort((a, b) => {
                const aItem = exerciseCatalog.find((item) => item.name === a);
                const bItem = exerciseCatalog.find((item) => item.name === b);
                return (aItem?.bodyPart === trainingForm.bodyPart ? 0 : 1) - (bItem?.bodyPart === trainingForm.bodyPart ? 0 : 1);
              });
              const selected = exerciseCatalog.find((item) => item.name === options[Number(e.detail.value)]);
              if (!selected) return;
              setTrainingForm({ ...trainingForm, bodyPart: selected.bodyPart, exercises: [{ ...trainingForm.exercises[0], name: selected.name, equipment: selected.equipment, bodyPart: selected.bodyPart }] });
            }}
          >
            <View style={inputStyle}><Text>{trainingForm.exercises[0]?.name || '选择动作名称'}</Text></View>
          </Picker>
          <Text style={{ display: 'block', marginTop: '10px', color: '#6D7686' }}>{trainingForm.exercises[0]?.equipment ? `当前器械 · ${trainingForm.exercises[0].equipment}` : '选择动作后会自动带出器械'}</Text>
          {trainingForm.bodyPart === '有氧' ? (
            <Picker mode='selector' range={durationMinuteOptions} onChange={(e) => setTrainingDraft({ ...trainingDraft, durationMinutes: Number(durationMinuteOptions[Number(e.detail.value)]) })}>
              <View style={inputStyle}><Text>{trainingDraft.durationMinutes ? `${trainingDraft.durationMinutes} 分钟` : '选择分钟数'}</Text></View>
            </Picker>
          ) : (
            <>
              <Picker mode='selector' range={createWeightOptions(trainingForm.exercises[0]?.equipment)} onChange={(e) => { const options = createWeightOptions(trainingForm.exercises[0]?.equipment); setTrainingDraft({ ...trainingDraft, workingWeightKg: Number(options[Number(e.detail.value)]) }); }}>
                <View style={inputStyle}><Text>{trainingDraft.workingWeightKg !== undefined ? `${trainingDraft.workingWeightKg} kg` : '选择做组重量'}</Text></View>
              </Picker>
              <Picker mode='selector' range={createWeightOptions(trainingForm.exercises[0]?.equipment)} onChange={(e) => { const options = createWeightOptions(trainingForm.exercises[0]?.equipment); setTrainingDraft({ ...trainingDraft, topWeightKg: Number(options[Number(e.detail.value)]) }); }}>
                <View style={inputStyle}><Text>{trainingDraft.topWeightKg !== undefined ? `${trainingDraft.topWeightKg} kg` : '选择极限重量'}</Text></View>
              </Picker>
              <Picker mode='selector' range={setCountOptions} onChange={(e) => setTrainingDraft({ ...trainingDraft, setCount: Number(setCountOptions[Number(e.detail.value)]) })}>
                <View style={inputStyle}><Text>{trainingDraft.setCount ? `${trainingDraft.setCount} 组` : '选择组数'}</Text></View>
              </Picker>
            </>
          )}
          <Button style={primaryButtonStyle} loading={saving} onClick={() => void saveTraining()}>
            保存训练记录
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
