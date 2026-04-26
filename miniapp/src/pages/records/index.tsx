import Taro from '@tarojs/taro';
import { Button, Input, Picker, ScrollView, Text, Textarea, View } from '@tarojs/components';
import { useEffect, useMemo, useState } from 'react';
import { createBodyRecord, fetchBodyRecords } from '@/services/modules/body-records';
import { createTrainingSession, fetchTrainingSessions } from '@/services/modules/training';
import { BodyRecordPayload, TrainingExercisePayload, TrainingSessionPayload, TrainingSetPayload } from '@/types/api';
import { tokens } from '@/utils/design';

type Mode = 'body' | 'training';

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

const createDefaultExercise = (index: number): TrainingExercisePayload => ({
  name: index === 0 ? '卧推' : '',
  equipment: index === 0 ? '杠铃' : '',
  bodyPart: '胸',
  sets: [createDefaultSet(1), createDefaultSet(2), createDefaultSet(3)],
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

export default function RecordsPage() {
  const [mode, setMode] = useState<Mode>('body');
  const [submitting, setSubmitting] = useState(false);
  const [entered, setEntered] = useState(false);
  const [bodyRecords, setBodyRecords] = useState<BodyRecordPayload[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<TrainingSessionPayload[]>([]);
  const [bodyForm, setBodyForm] = useState<BodyRecordPayload>(createEmptyBodyForm());
  const [trainingForm, setTrainingForm] = useState<TrainingSessionPayload>(createEmptyTrainingForm());

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
  };

  const removeExercise = (exerciseIndex: number) => {
    setTrainingForm((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, index) => index !== exerciseIndex),
    }));
  };

  const addSet = (exerciseIndex: number) => {
    setTrainingForm((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise, index) =>
        index === exerciseIndex
          ? { ...exercise, sets: [...exercise.sets, createDefaultSet(exercise.sets.length + 1)] }
          : exercise,
      ),
    }));
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    setTrainingForm((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise, index) => {
        if (index !== exerciseIndex) {
          return exercise;
        }

        const sets = exercise.sets
          .filter((_, currentIndex) => currentIndex !== setIndex)
          .map((set, currentIndex) => ({ ...set, setIndex: currentIndex + 1 }));

        return { ...exercise, sets };
      }),
    }));
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
      if (!exercise.sets.length) {
        return '每个动作至少保留一组';
      }
      const hasValidSet = exercise.sets.some((set) => set.weightKg || set.reps);
      if (!hasValidSet) {
        return `动作 ${exercise.name} 至少填写一组重量或次数`;
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
      Taro.showToast({ title: '身体记录已保存', icon: 'success' });
      setBodyForm(createEmptyBodyForm());
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
      await createTrainingSession(trainingForm);
      Taro.showToast({ title: '训练记录已保存', icon: 'success' });
      setTrainingForm(createEmptyTrainingForm());
      await loadData();
    } catch {
      Taro.showToast({ title: '训练记录保存失败', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView scrollY style={pageStyle}>
      <View style={pageContentStyle}>
      <View style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(235,243,255,0.88) 58%, rgba(219,232,250,0.95) 100%)', transform: entered ? 'translateY(0)' : 'translateY(18px)', opacity: entered ? '1' : '0.01', transition: 'all 360ms ease' }}>
        <Text style={{ display: 'block', fontSize: '38px', fontWeight: '700', color: '#101828', letterSpacing: '-0.04em' }}>记录中心</Text>
        <Text style={{ display: 'block', marginTop: '10px', color: '#607086', lineHeight: '1.8' }}>
          现在已经支持日期选择、基础校验、多动作多组训练录入，以及提交后自动重置表单，适合直接开始联调。
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

      {mode === 'body' ? (
        <View style={{ ...cardStyle, transform: entered ? 'translateY(0)' : 'translateY(26px)', opacity: entered ? '1' : '0.01', transition: 'all 440ms ease' }}>
          <Text style={sectionTitleStyle}>身体指标录入</Text>
          <Text style={{ display: 'block', marginTop: '10px', color: '#7A8598' }}>至少填写 1 项核心指标，适合训练前后快速记录。</Text>
          <View style={{ marginTop: '16px', padding: '18px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(21,122,255,0.08) 0%, rgba(114,185,255,0.12) 100%)', border: '1px solid rgba(175, 210, 248, 0.6)' }}>
            <Text style={{ color: '#5074A1', fontSize: '22px' }}>身体状态概览</Text>
            <View style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <View style={{ flex: 1, padding: '14px', borderRadius: '20px', background: 'rgba(255,255,255,0.8)' }}>
                <Text style={{ color: '#7B8DA9', fontSize: '20px' }}>当前体重</Text>
                <Text style={{ display: 'block', marginTop: '6px', fontSize: '32px', fontWeight: '700', color: '#157AFF' }}>{bodyForm.weightKg ?? '--'}</Text>
              </View>
              <View style={{ flex: 1, padding: '14px', borderRadius: '20px', background: 'rgba(255,255,255,0.8)' }}>
                <Text style={{ color: '#7B8DA9', fontSize: '20px' }}>当前体脂</Text>
                <Text style={{ display: 'block', marginTop: '6px', fontSize: '32px', fontWeight: '700', color: '#20A46A' }}>{bodyForm.bodyFatRate ?? '--'}</Text>
              </View>
            </View>
          </View>
          <Picker mode='date' value={bodyForm.recordDate} onChange={(e) => setBodyForm({ ...bodyForm, recordDate: e.detail.value })}>
            <View style={inputStyle}>
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
            style={{ ...inputStyle, minHeight: '140px' }}
            value={bodyForm.note || ''}
            onInput={(e) => setBodyForm({ ...bodyForm, note: e.detail.value })}
            placeholder='备注，例如空腹、训练后、体测环境'
          />
          <View style={{ display: 'flex', gap: '12px' }}>
            <Button style={mutedActionStyle} onClick={() => setBodyForm(createEmptyBodyForm())}>
              清空表单
            </Button>
            <Button style={actionStyle} loading={submitting} onClick={() => void submitBody()}>
              保存身体记录
            </Button>
          </View>
        </View>
      ) : (
        <View style={{ ...cardStyle, transform: entered ? 'translateY(0)' : 'translateY(26px)', opacity: entered ? '1' : '0.01', transition: 'all 440ms ease' }}>
          <Text style={sectionTitleStyle}>训练录入</Text>
          <Text style={{ display: 'block', marginTop: '10px', color: '#7A8598' }}>支持多动作多组，适合一次训练完整复盘。</Text>
          <View style={{ marginTop: '16px', padding: '18px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(32,164,106,0.08) 0%, rgba(119,215,167,0.12) 100%)', border: '1px solid rgba(180, 233, 206, 0.6)' }}>
            <Text style={{ color: '#4E8F71', fontSize: '22px' }}>训练负荷预览</Text>
            <Text style={{ display: 'block', marginTop: '8px', color: tokens.textSecondary, lineHeight: '1.7' }}>
              当前共录入 {trainingForm.exercises.length} 个动作，适合在一次训练结束后快速回放与补充细节。
            </Text>
          </View>
          <Picker mode='date' value={trainingForm.sessionDate} onChange={(e) => setTrainingForm({ ...trainingForm, sessionDate: e.detail.value })}>
            <View style={inputStyle}>
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
          <Textarea
            style={{ ...inputStyle, minHeight: '120px' }}
            value={trainingForm.note || ''}
            onInput={(e) => setTrainingForm({ ...trainingForm, note: e.detail.value })}
            placeholder='补充训练感受、当天状态、动作重点'
          />

          {trainingForm.exercises.map((exercise, exerciseIndex) => (
            <View key={`exercise-${exerciseIndex}`} style={{ ...cardStyle, marginTop: '20px', marginBottom: '0', background: 'linear-gradient(135deg, #FFFFFF 0%, #F4F8FF 100%)', border: '1px solid rgba(209, 221, 241, 0.78)' }}>
              <Text style={{ fontSize: '26px', fontWeight: '700', color: '#162033' }}>动作 {exerciseIndex + 1}</Text>
              <Input
                style={inputStyle}
                type='text'
                value={exercise.name}
                onInput={(e) => updateExerciseField(exerciseIndex, 'name', e.detail.value)}
                placeholder='动作名称，例如 卧推 / 深蹲'
              />
              <Input
                style={inputStyle}
                type='text'
                value={exercise.equipment || ''}
                onInput={(e) => updateExerciseField(exerciseIndex, 'equipment', e.detail.value)}
                placeholder='器械，例如 杠铃 / 哑铃 / 器械'
              />

              {exercise.sets.map((set, setIndex) => (
                <View key={`exercise-${exerciseIndex}-set-${setIndex}`} style={{ marginTop: '16px', padding: '16px', borderRadius: '22px', background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(218, 226, 239, 0.76)' }}>
                  <Text style={{ color: '#5A6980', fontWeight: '700' }}>第 {set.setIndex} 组</Text>
                  <Input
                    style={inputStyle}
                    type='digit'
                    value={set.weightKg?.toString() || ''}
                    onInput={(e) => updateSetField(exerciseIndex, setIndex, 'weightKg', e.detail.value)}
                    placeholder='重量 kg'
                  />
                  <Input
                    style={inputStyle}
                    type='number'
                    value={set.reps?.toString() || ''}
                    onInput={(e) => updateSetField(exerciseIndex, setIndex, 'reps', e.detail.value)}
                    placeholder='次数 reps'
                  />
                  <Input
                    style={inputStyle}
                    type='digit'
                    value={set.rpe?.toString() || ''}
                    onInput={(e) => updateSetField(exerciseIndex, setIndex, 'rpe', e.detail.value)}
                    placeholder='RPE（选填）'
                  />
                  <Button
                    style={{ ...mutedActionStyle, marginTop: '12px', opacity: exercise.sets.length <= 1 ? '0.45' : '1' }}
                    disabled={exercise.sets.length <= 1}
                    onClick={() => removeSet(exerciseIndex, setIndex)}
                  >
                    删除这一组
                  </Button>
                </View>
              ))}

              <View style={{ display: 'flex', gap: '12px' }}>
                <Button style={mutedActionStyle} onClick={() => addSet(exerciseIndex)}>
                  新增一组
                </Button>
                <Button
                  style={{ ...mutedActionStyle, opacity: trainingForm.exercises.length <= 1 ? '0.45' : '1' }}
                  disabled={trainingForm.exercises.length <= 1}
                  onClick={() => removeExercise(exerciseIndex)}
                >
                  删除动作
                </Button>
              </View>
            </View>
          ))}

          <View style={{ display: 'flex', gap: '12px' }}>
            <Button style={mutedActionStyle} onClick={() => addExercise()}>
              新增动作
            </Button>
            <Button style={mutedActionStyle} onClick={() => setTrainingForm(createEmptyTrainingForm())}>
              重置训练表单
            </Button>
          </View>

          <Button style={actionStyle} loading={submitting} onClick={() => void submitTraining()}>
            保存训练记录
          </Button>
        </View>
      )}

      <View style={{ ...cardStyle, transform: entered ? 'translateY(0)' : 'translateY(34px)', opacity: entered ? '1' : '0.01', transition: 'all 520ms ease' }}>
        <Text style={{ ...sectionTitleStyle, fontSize: '28px' }}>最近身体记录</Text>
        {latestBody.length ? (
          latestBody.map((item, index) => (
            <View key={`${item.recordDate}-${index}`} style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(218, 226, 239, 0.82)' }}>
              <Text style={{ display: 'block', color: '#162033' }}>{item.recordDate}</Text>
              <Text style={{ display: 'block', color: '#6C788A', marginTop: '6px' }}>
                体重 {item.weightKg || '-'} kg · 体脂 {item.bodyFatRate || '-'}% · 腰围 {item.waistCm || '-'} cm
              </Text>
            </View>
          ))
        ) : (
          <Text style={{ display: 'block', marginTop: '12px', color: '#8A94A6' }}>还没有身体记录。</Text>
        )}
      </View>

      <View style={{ ...cardStyle, transform: entered ? 'translateY(0)' : 'translateY(42px)', opacity: entered ? '1' : '0.01', transition: 'all 600ms ease' }}>
        <Text style={{ ...sectionTitleStyle, fontSize: '28px' }}>最近训练记录</Text>
        {latestTraining.length ? (
          latestTraining.map((item, index) => (
            <View key={`${item.sessionDate}-${index}`} style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(218, 226, 239, 0.82)' }}>
              <Text style={{ display: 'block', color: '#162033' }}>{item.sessionDate}</Text>
              <Text style={{ display: 'block', color: '#6C788A', marginTop: '6px' }}>
                {item.bodyPart} · {item.exercises?.[0]?.name || '未填写动作'} · {item.exercises?.[0]?.sets?.[0]?.weightKg || '-'} kg x {item.exercises?.[0]?.sets?.[0]?.reps || '-'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={{ display: 'block', marginTop: '12px', color: '#8A94A6' }}>还没有训练记录。</Text>
        )}
      </View>
      </View>
    </ScrollView>
  );
}
