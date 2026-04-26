import Taro from '@tarojs/taro';
import { Button, Input, Picker, ScrollView, Text, Textarea, View } from '@tarojs/components';
import { useEffect, useMemo, useState } from 'react';
import { createBodyRecord, fetchBodyRecords } from '@/services/modules/body-records';
import { createTrainingSession, fetchTrainingSessions } from '@/services/modules/training';
import { BodyRecordPayload, TrainingExercisePayload, TrainingSessionPayload, TrainingSetPayload } from '@/types/api';
import { tokens } from '@/utils/design';

type Mode = 'body' | 'training';

type ExerciseDraftConfig = {
  workingWeightKg?: number;
  topWeightKg?: number;
  setCount: number;
  durationMinutes?: number;
};

const today = new Date().toISOString().slice(0, 10);

const createEmptyBodyForm = (): BodyRecordPayload => ({
  recordDate: today,
  weightKg: undefined,
  bodyFatRate: undefined,
  waistCm: undefined,
  note: '',
});

const createDefaultSet = (setIndex: number): TrainingSetPayload => ({
  setIndex,
  weightKg: undefined,
  reps: undefined,
  rpe: undefined,
  note: '',
});

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

const trainingTemplates: Record<string, Array<{ name: string; equipment: string; bodyPart: string }>> = {
  胸: [
    { name: '卧推', equipment: '杠铃', bodyPart: '胸' },
    { name: '上斜卧推', equipment: '哑铃', bodyPart: '胸' },
    { name: '绳索夹胸', equipment: '绳索', bodyPart: '胸' },
  ],
  背: [
    { name: '高位下拉', equipment: '器械', bodyPart: '背' },
    { name: '杠铃划船', equipment: '杠铃', bodyPart: '背' },
    { name: '坐姿划船', equipment: '器械', bodyPart: '背' },
  ],
  肩: [
    { name: '肩上推举', equipment: '杠铃', bodyPart: '肩' },
    { name: '侧平举', equipment: '哑铃', bodyPart: '肩' },
  ],
  腿: [
    { name: '深蹲', equipment: '杠铃', bodyPart: '腿' },
    { name: '腿举', equipment: '器械', bodyPart: '腿' },
    { name: '罗马尼亚硬拉', equipment: '杠铃', bodyPart: '腿' },
  ],
  手臂: [
    { name: '二头弯举', equipment: '哑铃', bodyPart: '手臂' },
    { name: '绳索下压', equipment: '绳索', bodyPart: '手臂' },
  ],
  核心: [{ name: '平板支撑', equipment: '自重', bodyPart: '核心' }],
  有氧: [{ name: '跑步', equipment: '跑步机', bodyPart: '有氧' }],
};

const exerciseNames = exerciseCatalog.map((item) => item.name);

const equipmentWeightRanges: Record<string, { max: number; step: number }> = {
  杠铃: { max: 320, step: 2.5 },
  哑铃: { max: 80, step: 2.5 },
  器械: { max: 200, step: 2.5 },
  绳索: { max: 120, step: 2.5 },
  壶铃: { max: 80, step: 2.5 },
  自重: { max: 60, step: 2.5 },
};

const createDefaultExercise = (index: number): TrainingExercisePayload => ({
  name: index === 0 ? '卧推' : '',
  equipment: index === 0 ? '杠铃' : '',
  bodyPart: '胸',
  sets: [createDefaultSet(1)],
});

const createDefaultExerciseDraft = (): ExerciseDraftConfig => ({
  workingWeightKg: undefined,
  topWeightKg: undefined,
  setCount: 3,
  durationMinutes: undefined,
});

const createEmptyTrainingForm = (): TrainingSessionPayload => ({
  sessionDate: today,
  bodyPart: '胸',
  note: '',
  exercises: [createDefaultExercise(0)],
});

const pageStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #F5F7FB 0%, #EEF2F8 50%, #E8EEF7 100%)',
};

const pageContentStyle = {
  padding: '28px 24px 120px',
};

const cardStyle = {
  background: 'rgba(255, 255, 255, 0.8)',
  borderRadius: '30px',
  padding: '24px',
  marginBottom: '20px',
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

const mutedActionStyle = {
  background: 'rgba(240, 244, 252, 0.96)',
  color: '#536173',
  borderRadius: '999px',
  marginTop: '14px',
  border: '1px solid rgba(203, 214, 230, 0.82)',
};

const actionStyle = {
  background: 'linear-gradient(135deg, #157AFF 0%, #55A3FF 100%)',
  color: '#FFFFFF',
  borderRadius: '999px',
  marginTop: '20px',
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

const historySectionStyle = {
  ...cardStyle,
  padding: '22px 24px',
};

const historyItemStyle = {
  marginTop: '14px',
  padding: '16px 18px',
  borderRadius: '22px',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(246,250,255,0.94) 100%)',
  border: '1px solid rgba(213, 221, 232, 0.76)',
  boxShadow: '0 8px 18px rgba(125, 142, 168, 0.06), inset 0 1px 0 rgba(255,255,255,0.92)',
};

const formContentStyle = {
  overflow: 'hidden',
};

const sectionTitleStyle = {
  fontSize: '30px',
  fontWeight: '700',
  color: '#162033',
  letterSpacing: '-0.03em',
};

const bodyPartOptions = ['胸', '背', '肩', '腿', '手臂', '核心', '全身', '有氧'];

function parseNumber(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function createWeightOptions(equipment?: string) {
  const config = equipment ? equipmentWeightRanges[equipment] : undefined;
  const max = config?.max ?? 200;
  const step = config?.step ?? 2.5;
  return Array.from({ length: Math.floor(max / step) + 1 }, (_, index) => `${Number((index * step).toFixed(1))}`);
}

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

export default function RecordsPage() {
  const [mode, setMode] = useState<Mode>('body');
  const [submitting, setSubmitting] = useState(false);
  const [entered, setEntered] = useState(false);
  const [bodyExpanded, setBodyExpanded] = useState(false);
  const [trainingExpanded, setTrainingExpanded] = useState(false);
  const [bodyRecords, setBodyRecords] = useState<BodyRecordPayload[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<TrainingSessionPayload[]>([]);
  const [bodyForm, setBodyForm] = useState<BodyRecordPayload>(createEmptyBodyForm());
  const [trainingForm, setTrainingForm] = useState<TrainingSessionPayload>(createEmptyTrainingForm());
  const [exerciseDrafts, setExerciseDrafts] = useState<ExerciseDraftConfig[]>([createDefaultExerciseDraft()]);

  const latestBody = useMemo(() => bodyRecords.slice(0, 3), [bodyRecords]);
  const latestTraining = useMemo(() => trainingRecords.slice(0, 3), [trainingRecords]);

  const loadData = async () => {
    try {
      const [bodyRes, trainingRes] = await Promise.all([fetchBodyRecords(1, 6), fetchTrainingSessions(1, 6)]);
      setBodyRecords(bodyRes.items || []);
      setTrainingRecords(trainingRes.items || []);
    } catch {
      Taro.showToast({ title: '读取记录失败', icon: 'none' });
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 40);
    return () => clearTimeout(timer);
  }, []);

  const updateBodyNumberField = (field: keyof BodyRecordPayload, value: string) => {
    setBodyForm((prev) => ({ ...prev, [field]: parseNumber(value) }));
  };

  const updateExerciseField = (exerciseIndex: number, field: keyof TrainingExercisePayload, value: string) => {
    setTrainingForm((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise, index) =>
        index === exerciseIndex ? { ...exercise, [field]: value } : exercise,
      ),
    }));
  };

  const chooseExercise = (exerciseIndex: number, name: string) => {
    const selected = exerciseCatalog.find((item) => item.name === name);
    if (!selected) {
      return;
    }

    setTrainingForm((prev) => ({
      ...prev,
      bodyPart: selected.bodyPart,
      exercises: prev.exercises.map((exercise, index) =>
        index === exerciseIndex
          ? { ...exercise, name: selected.name, equipment: selected.equipment, bodyPart: selected.bodyPart }
          : exercise,
      ),
    }));
  };

  const getOrderedExerciseOptions = (bodyPart: string) => {
    return exerciseCatalog
      .sort((a, b) => {
        const aScore = a.bodyPart === bodyPart ? 0 : 1;
        const bScore = b.bodyPart === bodyPart ? 0 : 1;
        return aScore - bScore;
      })
      .map((item) => item.name);
  };

  const updateExerciseDraft = (exerciseIndex: number, patch: Partial<ExerciseDraftConfig>) => {
    setExerciseDrafts((prev) => prev.map((item, index) => (index === exerciseIndex ? { ...item, ...patch } : item)));
  };

  const updateSetField = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof TrainingSetPayload,
    value: string,
  ) => {
    setTrainingForm((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise, index) => {
        if (index !== exerciseIndex) {
          return exercise;
        }

        return {
          ...exercise,
          sets: exercise.sets.map((set, currentSetIndex) =>
            currentSetIndex === setIndex
              ? {
                  ...set,
                  [field]: field === 'note' ? value : parseNumber(value),
                }
              : set,
          ),
        };
      }),
    }));
  };

  const addExercise = () => {
    setTrainingForm((prev) => ({
      ...prev,
      exercises: [...prev.exercises, createDefaultExercise(prev.exercises.length)],
    }));
    setExerciseDrafts((prev) => [...prev, createDefaultExerciseDraft()]);
  };

  const removeExercise = (exerciseIndex: number) => {
    setTrainingForm((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, index) => index !== exerciseIndex),
    }));
    setExerciseDrafts((prev) => prev.filter((_, index) => index !== exerciseIndex));
  };

  const validateBodyForm = () => {
    if (!bodyForm.recordDate) {
      return '请选择记录日期';
    }
    if (!bodyForm.weightKg && !bodyForm.bodyFatRate && !bodyForm.waistCm) {
      return '至少填写体重、体脂率、腰围中的一项';
    }

    return '';
  };

  const validateTrainingForm = () => {
    if (!trainingForm.sessionDate) {
      return '请选择训练日期';
    }
    if (!trainingForm.bodyPart) {
      return '请选择训练部位';
    }
    if (!trainingForm.exercises.length) {
      return '至少添加一个训练动作';
    }

    for (const exercise of trainingForm.exercises) {
      if (!exercise.name) {
        return '请填写动作名称';
      }
      const draft = exerciseDrafts[trainingForm.exercises.indexOf(exercise)];
      if (trainingForm.bodyPart === '有氧') {
        if (!draft?.durationMinutes) {
          return `动作 ${exercise.name} 请填写训练时长`;
        }
      } else {
        if (!draft?.setCount) {
          return `动作 ${exercise.name} 请填写组数`;
        }
        if (!draft?.workingWeightKg && !draft?.topWeightKg) {
          return `动作 ${exercise.name} 请填写做组重量或极限重量`;
        }
      }
    }

    return '';
  };

  const submitBody = async () => {
    const message = validateBodyForm();
    if (message) {
      Taro.showToast({ title: message, icon: 'none' });
      return;
    }

    setSubmitting(true);
    try {
      await createBodyRecord(bodyForm);
      Taro.showToast({ title: '身体状态已留存', icon: 'success' });
      setBodyForm(createEmptyBodyForm());
      setBodyExpanded(false);
      void Taro.pageScrollTo({ selector: '#body-record-section', offsetTop: 20, duration: 280 });
      await loadData();
    } catch {
      Taro.showToast({ title: '身体记录保存失败', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  const submitTraining = async () => {
    const message = validateTrainingForm();
    if (message) {
      Taro.showToast({ title: message, icon: 'none' });
      return;
    }

    setSubmitting(true);
    try {
      const payload: TrainingSessionPayload = {
        ...trainingForm,
        exercises: trainingForm.exercises.map((exercise, index) => {
          const draft = exerciseDrafts[index] || createDefaultExerciseDraft();
          const isCardio = trainingForm.bodyPart === '有氧';

          return {
            ...exercise,
            exerciseType: isCardio ? 'CARDIO' : 'STRENGTH',
            workingWeightKg: isCardio ? undefined : draft.workingWeightKg,
            topWeightKg: isCardio ? undefined : draft.topWeightKg,
            setCount: isCardio ? undefined : draft.setCount,
            durationMinutes: isCardio ? draft.durationMinutes : undefined,
            sets: [],
          };
        }),
      };

      await createTrainingSession(payload);
      Taro.showToast({ title: '训练记录已留存', icon: 'success' });
      setTrainingForm(createEmptyTrainingForm());
      setExerciseDrafts([createDefaultExerciseDraft()]);
      setTrainingExpanded(false);
      void Taro.pageScrollTo({ selector: '#training-record-section', offsetTop: 20, duration: 280 });
      await loadData();
    } catch {
      Taro.showToast({ title: '训练记录保存失败', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleBodyExpanded = () => {
    const next = !bodyExpanded;
    setBodyExpanded(next);

    setTimeout(() => {
      scrollSelectorIntoView(next ? '#body-record-collapse-anchor' : '#body-record-section');
    }, 40);
  };

  const toggleTrainingExpanded = () => {
    const next = !trainingExpanded;
    setTrainingExpanded(next);

    setTimeout(() => {
      scrollSelectorIntoView(next ? '#training-record-collapse-anchor' : '#training-record-section');
    }, 40);
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
            <Text style={{ display: 'block', fontSize: '14px', letterSpacing: '0.24em', color: '#7A97BE' }}>RECORD STUDIO</Text>
            <Text style={{ display: 'block', marginTop: '6px', fontSize: '40px', fontWeight: '700', color: '#101828', letterSpacing: '-0.04em', lineHeight: '1.02' }}>记录中心</Text>
          </View>
          <View style={{ padding: '7px 11px', borderRadius: '999px', background: 'rgba(255,255,255,0.66)', border: '1px solid rgba(255,255,255,0.84)' }}>
            <Text style={{ color: '#4C78AE', fontSize: '15px', fontWeight: '600', letterSpacing: '0.1em' }}>{mode === 'body' ? 'BODY' : 'TRAINING'}</Text>
          </View>
        </View>
        <Text style={{ display: 'block', marginTop: '8px', color: '#5B6B83', lineHeight: '1.6', fontSize: '18px', maxWidth: '560px' }}>
          把身体变化与训练细节留在同一个空间里，让每一次投入都有迹可循。
        </Text>
        <View style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <Button
            style={{ ...actionStyle, marginTop: '0', opacity: mode === 'body' ? '1' : '0.5' }}
            onClick={() => setMode('body')}
          >
            身体记录
          </Button>
          <Button
            style={{ ...actionStyle, marginTop: '0', opacity: mode === 'training' ? '1' : '0.5' }}
            onClick={() => setMode('training')}
          >
            训练记录
          </Button>
        </View>
        </View>
      </View>

      {mode === 'body' ? (
        <View id='body-record-section' style={{ ...cardStyle, ...formContentStyle, transform: entered ? 'translateY(0)' : 'translateY(26px)', opacity: entered ? '1' : '0.01', transition: 'all 440ms ease' }}>
          <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <View>
              <Text style={sectionEyebrowStyle}>BODY METRICS</Text>
              <Text style={sectionHeadingStyle}>身体指标录入</Text>
            </View>
            <View style={sectionMetaWrapStyle}>
              <View style={sectionMetaLineStyle} />
              <Text style={sectionMetaTextStyle}>INPUT</Text>
            </View>
          </View>
          <Text style={{ display: 'block', marginTop: '10px', color: '#7A8598' }}>留下今天的身体状态，让变化开始拥有参照。</Text>
          <View style={{ marginTop: '16px', padding: '18px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(21,122,255,0.08) 0%, rgba(114,185,255,0.12) 100%)', border: '1px solid rgba(175, 210, 248, 0.6)' }}>
            <Text style={{ color: '#5074A1', fontSize: '22px' }}>身体状态概览</Text>
            <View style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <View style={{ flex: 1, padding: '14px', borderRadius: '20px', background: 'rgba(255,255,255,0.8)' }}>
                <Text style={{ color: '#7B8DA9', fontSize: '20px' }}>当前体重</Text>
                <Text style={{ display: 'block', marginTop: '6px', fontSize: '32px', fontWeight: '700', color: '#157AFF' }}>{latestBody[0]?.weightKg ?? '--'}</Text>
              </View>
              <View style={{ flex: 1, padding: '14px', borderRadius: '20px', background: 'rgba(255,255,255,0.8)' }}>
                <Text style={{ color: '#7B8DA9', fontSize: '20px' }}>当前体脂</Text>
                <Text style={{ display: 'block', marginTop: '6px', fontSize: '32px', fontWeight: '700', color: '#20A46A' }}>{latestBody[0]?.bodyFatRate ?? '--'}</Text>
              </View>
            </View>
          </View>
          {!bodyExpanded && (
            <Button style={{ ...actionStyle, marginTop: '16px' }} onClick={toggleBodyExpanded}>
              填写身体记录
            </Button>
          )}
          {bodyExpanded && (
            <>
          <Button id='body-record-collapse-anchor' style={{ ...mutedActionStyle, marginTop: '16px' }} onClick={toggleBodyExpanded}>
            收起填写
          </Button>
          <Picker mode='date' value={bodyForm.recordDate} onChange={(e) => setBodyForm({ ...bodyForm, recordDate: e.detail.value })}>
            <View id='body-record-first-field' style={inputStyle}>
              <Text>{bodyForm.recordDate || '选择记录日期'}</Text>
            </View>
          </Picker>
          <Input
            style={inputStyle}
            type='digit'
            value={bodyForm.weightKg?.toString() || ''}
            onInput={(e) => updateBodyNumberField('weightKg', e.detail.value)}
            placeholder='体重 kg'
          />
          <Input
            style={inputStyle}
            type='digit'
            value={bodyForm.bodyFatRate?.toString() || ''}
            onInput={(e) => updateBodyNumberField('bodyFatRate', e.detail.value)}
            placeholder='体脂率 %'
          />
          <Input
            style={inputStyle}
            type='digit'
            value={bodyForm.waistCm?.toString() || ''}
            onInput={(e) => updateBodyNumberField('waistCm', e.detail.value)}
            placeholder='腰围 cm'
          />
          <Input
            style={inputStyle}
            type='digit'
            value={bodyForm.chestCm?.toString() || ''}
            onInput={(e) => updateBodyNumberField('chestCm', e.detail.value)}
            placeholder='胸围 cm（选填）'
          />
          <Textarea
            style={{ ...inputStyle, minHeight: '140px', display: 'block', width: 'auto', boxSizing: 'border-box' }}
            value={bodyForm.note || ''}
            onInput={(e) => setBodyForm({ ...bodyForm, note: e.detail.value })}
            placeholder='备注，例如空腹、训练后、体测环境'
          />
          <View style={{ display: 'flex', gap: '12px' }}>
            <Button style={mutedActionStyle} onClick={() => setBodyForm(createEmptyBodyForm())}>
              清空本次
            </Button>
            <Button style={actionStyle} loading={submitting} onClick={() => void submitBody()}>
              留存记录
            </Button>
          </View>
            </>
          )}
        </View>
      ) : (
        <View id='training-record-section' style={{ ...cardStyle, ...formContentStyle, transform: entered ? 'translateY(0)' : 'translateY(26px)', opacity: entered ? '1' : '0.01', transition: 'all 440ms ease' }}>
          <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <View>
              <Text style={sectionEyebrowStyle}>TRAINING LOG</Text>
              <Text style={sectionHeadingStyle}>训练录入</Text>
            </View>
            <View style={sectionMetaWrapStyle}>
              <View style={sectionMetaLineStyle} />
              <Text style={sectionMetaTextStyle}>SESSION</Text>
            </View>
          </View>
          <Text style={{ display: 'block', marginTop: '10px', color: '#7A8598' }}>把一次训练的重点、动作与负荷完整留住。</Text>
          <View style={{ marginTop: '16px', padding: '18px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(32,164,106,0.08) 0%, rgba(119,215,167,0.12) 100%)', border: '1px solid rgba(180, 233, 206, 0.6)' }}>
            <Text style={{ color: '#4E8F71', fontSize: '22px' }}>训练负荷预览</Text>
            <Text style={{ display: 'block', marginTop: '8px', color: tokens.textSecondary, lineHeight: '1.7' }}>
              当前共录入 {trainingForm.exercises.length} 个动作，适合在一次训练结束后快速回放与补充细节。
            </Text>
          </View>
          {!trainingExpanded && (
            <Button style={{ ...actionStyle, marginTop: '16px', background: 'linear-gradient(135deg, #20A46A 0%, #67D597 100%)', boxShadow: '0 12px 26px rgba(32, 164, 106, 0.22)' }} onClick={toggleTrainingExpanded}>
              填写训练记录
            </Button>
          )}
          {trainingExpanded && (
            <>
          <Button id='training-record-collapse-anchor' style={{ ...mutedActionStyle, marginTop: '16px' }} onClick={toggleTrainingExpanded}>
            收起填写
          </Button>
          <Picker mode='date' value={trainingForm.sessionDate} onChange={(e) => setTrainingForm({ ...trainingForm, sessionDate: e.detail.value })}>
            <View id='training-record-first-field' style={inputStyle}>
              <Text>{trainingForm.sessionDate || '选择训练日期'}</Text>
            </View>
          </Picker>
          <Picker
            mode='selector'
            range={bodyPartOptions}
            onChange={(e) => setTrainingForm({ ...trainingForm, bodyPart: bodyPartOptions[Number(e.detail.value)] })}
          >
            <View style={inputStyle}>
              <Text>{trainingForm.bodyPart || '选择训练部位'}</Text>
            </View>
          </Picker>
          {trainingForm.exercises.map((exercise, exerciseIndex) => (
            <View key={`exercise-${exerciseIndex}`} style={{ ...cardStyle, ...formContentStyle, marginTop: '20px', marginBottom: '0', background: 'linear-gradient(135deg, #FFFFFF 0%, #F4F8FF 100%)', border: '1px solid rgba(209, 221, 241, 0.78)' }}>
              <Text style={{ fontSize: '26px', fontWeight: '700', color: '#162033' }}>动作 {exerciseIndex + 1}</Text>
              {(() => {
                const orderedExerciseOptions = getOrderedExerciseOptions(trainingForm.bodyPart);

                return (
              <Picker
                mode='selector'
                range={orderedExerciseOptions}
                onChange={(e) => {
                  chooseExercise(exerciseIndex, orderedExerciseOptions[Number(e.detail.value)]);
                }}
              >
                <View style={inputStyle}>
                  <Text style={{ color: exercise.name ? '#162033' : '#8A94A6' }}>{exercise.name || '选择动作名称'}</Text>
                </View>
              </Picker>
                );
              })()}
              <Text style={{ display: 'block', marginTop: '10px', color: '#6D7686' }}>
                {exercise.equipment ? `当前器械 · ${exercise.equipment}` : '选择动作后会自动带出器械'}
              </Text>
              {trainingForm.bodyPart === '有氧' ? (
                <View style={{ ...formContentStyle, marginTop: '16px', padding: '16px', borderRadius: '22px', background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(218, 226, 239, 0.76)' }}>
                  <Text style={{ color: '#5A6980', fontWeight: '700' }}>训练时长</Text>
                  <Picker mode='selector' range={durationMinuteOptions} onChange={(e) => updateExerciseDraft(exerciseIndex, { durationMinutes: Number(durationMinuteOptions[Number(e.detail.value)]) })}>
                    <View style={inputStyle}>
                      <Text style={{ color: exerciseDrafts[exerciseIndex]?.durationMinutes ? '#162033' : '#8A94A6' }}>{exerciseDrafts[exerciseIndex]?.durationMinutes ? `${exerciseDrafts[exerciseIndex]?.durationMinutes} 分钟` : '选择分钟数'}</Text>
                    </View>
                  </Picker>
                </View>
              ) : (
                <View style={{ ...formContentStyle, marginTop: '16px', padding: '16px', borderRadius: '22px', background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(218, 226, 239, 0.76)' }}>
                  <Text style={{ color: '#5A6980', fontWeight: '700' }}>训练配置</Text>
                  {(() => {
                    const weightOptions = createWeightOptions(exercise.equipment);
                    const defaultWorking = exercise.equipment === '哑铃' ? 20 : exercise.equipment === '杠铃' ? 60 : 40;
                    const defaultTop = exercise.equipment === '哑铃' ? 24 : exercise.equipment === '杠铃' ? 80 : 50;

                    return (
                      <>
                  <Picker
                    mode='selector'
                    range={weightOptions}
                    value={Math.max(0, weightOptions.indexOf(String(exerciseDrafts[exerciseIndex]?.workingWeightKg ?? defaultWorking)))}
                    onChange={(e) => updateExerciseDraft(exerciseIndex, { workingWeightKg: Number(weightOptions[Number(e.detail.value)]) })}
                  >
                    <View style={inputStyle}>
                      <Text style={{ color: exerciseDrafts[exerciseIndex]?.workingWeightKg !== undefined ? '#162033' : '#8A94A6' }}>{exerciseDrafts[exerciseIndex]?.workingWeightKg !== undefined ? `${exerciseDrafts[exerciseIndex]?.workingWeightKg} kg` : '选择做组重量'}</Text>
                    </View>
                  </Picker>
                  <Picker
                    mode='selector'
                    range={weightOptions}
                    value={Math.max(0, weightOptions.indexOf(String(exerciseDrafts[exerciseIndex]?.topWeightKg ?? exerciseDrafts[exerciseIndex]?.workingWeightKg ?? defaultTop)))}
                    onChange={(e) => updateExerciseDraft(exerciseIndex, { topWeightKg: Number(weightOptions[Number(e.detail.value)]) })}
                  >
                    <View style={inputStyle}>
                      <Text style={{ color: exerciseDrafts[exerciseIndex]?.topWeightKg !== undefined ? '#162033' : '#8A94A6' }}>{exerciseDrafts[exerciseIndex]?.topWeightKg !== undefined ? `${exerciseDrafts[exerciseIndex]?.topWeightKg} kg` : '选择极限重量'}</Text>
                    </View>
                  </Picker>
                      </>
                    );
                  })()}
                  <Picker mode='selector' range={setCountOptions} onChange={(e) => updateExerciseDraft(exerciseIndex, { setCount: Number(setCountOptions[Number(e.detail.value)]) })}>
                    <View style={inputStyle}>
                      <Text style={{ color: exerciseDrafts[exerciseIndex]?.setCount ? '#162033' : '#8A94A6' }}>{exerciseDrafts[exerciseIndex]?.setCount ? `${exerciseDrafts[exerciseIndex]?.setCount} 组` : '选择组数'}</Text>
                    </View>
                  </Picker>
                </View>
              )}

              <View style={{ display: 'flex', gap: '12px' }}>
                <Button
                  style={{ ...mutedActionStyle, opacity: trainingForm.exercises.length <= 1 ? '0.45' : '1' }}
                  disabled={trainingForm.exercises.length <= 1}
                  onClick={() => removeExercise(exerciseIndex)}
                >
                  移除动作
                </Button>
              </View>
            </View>
          ))}

          <View style={{ display: 'flex', gap: '12px' }}>
            <Button style={mutedActionStyle} onClick={() => addExercise()}>
              添加动作
            </Button>
            <Button style={mutedActionStyle} onClick={() => setTrainingForm(createEmptyTrainingForm())}>
              重新开始
            </Button>
          </View>

          <Button style={actionStyle} loading={submitting} onClick={() => void submitTraining()}>
            留存训练
          </Button>
            </>
          )}
        </View>
      )}

      <View style={{ ...historySectionStyle, transform: entered ? 'translateY(0)' : 'translateY(34px)', opacity: entered ? '1' : '0.01', transition: 'all 520ms ease' }}>
        <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <Text style={sectionEyebrowStyle}>RECENT BODY</Text>
            <Text style={{ ...sectionHeadingStyle, fontSize: '28px' }}>最近身体记录</Text>
          </View>
          <View style={sectionMetaWrapStyle}>
            <View style={sectionMetaLineStyle} />
            <Text style={sectionMetaTextStyle}>HISTORY</Text>
          </View>
        </View>
        {latestBody.length ? (
          latestBody.map((item, index) => (
            <View key={`${item.recordDate}-${index}`} style={historyItemStyle}>
              <Text style={{ display: 'block', color: '#162033' }}>{item.recordDate}</Text>
              <Text style={{ display: 'block', color: '#6C788A', marginTop: '6px' }}>
                体重 {item.weightKg || '-'} kg · 体脂 {item.bodyFatRate || '-'}% · 腰围 {item.waistCm || '-'} cm
              </Text>
            </View>
          ))
        ) : (
          <Text style={{ display: 'block', marginTop: '12px', color: '#8A94A6' }}>你的第一条身体记录，会让之后的变化更值得回看。</Text>
        )}
      </View>

      <View style={{ ...historySectionStyle, transform: entered ? 'translateY(0)' : 'translateY(42px)', opacity: entered ? '1' : '0.01', transition: 'all 600ms ease' }}>
        <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <Text style={sectionEyebrowStyle}>RECENT SESSION</Text>
            <Text style={{ ...sectionHeadingStyle, fontSize: '28px' }}>最近训练记录</Text>
          </View>
          <View style={sectionMetaWrapStyle}>
            <View style={sectionMetaLineStyle} />
            <Text style={sectionMetaTextStyle}>HISTORY</Text>
          </View>
        </View>
        {latestTraining.length ? (
          latestTraining.map((item, index) => (
            <View key={`${item.sessionDate}-${index}`} style={historyItemStyle}>
              <Text style={{ display: 'block', color: '#162033' }}>{item.sessionDate}</Text>
              <Text style={{ display: 'block', color: '#6C788A', marginTop: '6px' }}>
                {item.bodyPart} · {item.exercises?.[0]?.name || '未填写动作'} · {item.exercises?.[0]?.sets?.[0]?.weightKg || '-'} kg x {item.exercises?.[0]?.sets?.[0]?.reps || '-'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={{ display: 'block', marginTop: '12px', color: '#8A94A6' }}>从第一次训练开始，力量与节奏都会慢慢有迹可循。</Text>
        )}
      </View>
      </View>
    </ScrollView>
  );
}
