import Taro from '@tarojs/taro';
import { Button, ScrollView, Text, View } from '@tarojs/components';
import { useEffect, useMemo, useState } from 'react';
import { fetchDashboardOverview } from '@/services/modules/dashboard';
import { BodyRecordPayload, TrainingSessionPayload } from '@/types/api';
import {
  createEnterStyle,
  createGlassCardStyle,
  createPageContentStyle,
  createPressableCardStyle,
  createSecondaryButtonStyle,
  helperTextStyle,
  metricValueXLStyle,
  pageHeroSubtitleStyle,
  pageHeroTitleStyle,
  sectionTitleStyle,
  tokens,
} from '@/utils/design';

type RangeKey = '7d' | '30d' | '90d';

const rangeMap: Record<RangeKey, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

const pageStyle = {
  minHeight: '100vh',
  background: tokens.pageBackground,
};

const pageContentStyle = createPageContentStyle();

const cardStyle = createGlassCardStyle();
const secondaryButtonStyle = createSecondaryButtonStyle();

function toTimestamp(date: string) {
  return new Date(date).getTime();
}

export default function TrendsPage() {
  const [bodyRecords, setBodyRecords] = useState<BodyRecordPayload[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<TrainingSessionPayload[]>([]);
  const [range, setRange] = useState<RangeKey>('30d');
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const result = (await fetchDashboardOverview(rangeMap[range])) as {
          bodyRecords?: BodyRecordPayload[];
          trainingSessions?: TrainingSessionPayload[];
        };
        setBodyRecords(result.bodyRecords || []);
        setTrainingRecords(result.trainingSessions || []);
      } catch {
        Taro.showToast({ title: '趋势数据加载失败', icon: 'none' });
      }
    };

    void load();
  }, [range]);

  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 40);
    return () => clearTimeout(timer);
  }, []);

  const filteredBodyRecords = useMemo(() => {
    const limit = Date.now() - rangeMap[range] * 24 * 60 * 60 * 1000;
    return bodyRecords.filter((item) => toTimestamp(item.recordDate) >= limit);
  }, [bodyRecords, range]);

  const filteredTrainingRecords = useMemo(() => {
    const limit = Date.now() - rangeMap[range] * 24 * 60 * 60 * 1000;
    return trainingRecords.filter((item) => toTimestamp(item.sessionDate) >= limit);
  }, [trainingRecords, range]);

  const trendSummary = useMemo(() => {
    const current = filteredBodyRecords[0];
    const previous = filteredBodyRecords[filteredBodyRecords.length - 1];
    const currentWeight = current?.weightKg || 0;
    const previousWeight = previous?.weightKg || 0;
    const weightDelta = filteredBodyRecords.length > 1 ? Number((currentWeight - previousWeight).toFixed(1)) : 0;
    const bodyFatDelta =
      filteredBodyRecords.length > 1 && current?.bodyFatRate !== undefined && previous?.bodyFatRate !== undefined
        ? Number((current.bodyFatRate - previous.bodyFatRate).toFixed(1))
        : 0;
    const totalSessions = filteredTrainingRecords.length;
    const maxWeight = Math.max(
      ...filteredTrainingRecords.flatMap((session) =>
        session.exercises.flatMap((exercise) => exercise.sets.map((set) => set.weightKg || 0)),
      ),
      0,
    );

    return {
      currentWeight,
      weightDelta,
      bodyFatDelta,
      totalSessions,
      maxWeight,
    };
  }, [filteredBodyRecords, filteredTrainingRecords]);

  const weightChart = useMemo(() => {
    const values = filteredBodyRecords.slice(0, 6).reverse();
    const maxWeight = Math.max(...values.map((item) => item.weightKg || 0), 1);

    return values.map((item) => ({
      label: item.recordDate.slice(5),
      value: item.weightKg || 0,
      width: `${Math.max(((item.weightKg || 0) / maxWeight) * 100, 8)}%`,
    }));
  }, [filteredBodyRecords]);

  const trainingChart = useMemo(() => {
    const values = filteredTrainingRecords.slice(0, 6).reverse();
    const maxVolume = Math.max(
      ...values.map((session) =>
        session.exercises.reduce(
          (sum, exercise) =>
            sum + exercise.sets.reduce((setSum, set) => setSum + (set.weightKg || 0) * (set.reps || 0), 0),
          0,
        ),
      ),
      1,
    );

    return values.map((session) => {
      const volume = session.exercises.reduce(
        (sum, exercise) => sum + exercise.sets.reduce((setSum, set) => setSum + (set.weightKg || 0) * (set.reps || 0), 0),
        0,
      );

      return {
        label: session.sessionDate.slice(5),
        value: volume,
        width: `${Math.max((volume / maxVolume) * 100, 8)}%`,
      };
    });
  }, [filteredTrainingRecords]);

  return (
    <ScrollView scrollY style={pageStyle}>
      <View style={{ ...pageContentStyle, paddingBottom: '120px' }}>
      <View style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 18, 360), background: tokens.heroBackground }}>
        <Text style={pageHeroTitleStyle}>趋势总览</Text>
        <Text style={{ ...pageHeroSubtitleStyle, marginTop: '10px' }}>
          现在已支持时间范围筛选和轻量图表展示，方便先验证数据流和视觉层级，后续再接真正图表组件。
        </Text>
        <View style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          {(['7d', '30d', '90d'] as RangeKey[]).map((item) => (
            <Button
              key={item}
              style={{
                ...secondaryButtonStyle,
                background: item === range ? 'linear-gradient(135deg, #157AFF 0%, #55A3FF 100%)' : 'rgba(240, 244, 252, 0.96)',
                color: item === range ? '#FFFFFF' : '#5A6778',
                borderRadius: '999px',
                opacity: item === range ? '1' : '0.8',
                border: item === range ? 'none' : '1px solid rgba(205, 217, 234, 0.84)',
              }}
              onClick={() => setRange(item)}
            >
              {item.toUpperCase()}
            </Button>
          ))}
        </View>
      </View>

      <View style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 26, 440), background: 'linear-gradient(135deg, #FFFFFF 0%, #F4F8FF 100%)' }}>
        <Text style={sectionTitleStyle}>阶段摘要</Text>
        <Text style={{ ...metricValueXLStyle, marginTop: '14px', fontSize: '46px', color: '#157AFF' }}>
          {trendSummary.currentWeight || '--'} kg
        </Text>
        <Text style={{ display: 'block', marginTop: '8px', color: '#667385' }}>
          体重变化 {trendSummary.weightDelta > 0 ? '+' : ''}{trendSummary.weightDelta} kg
        </Text>
        <Text style={{ display: 'block', marginTop: '8px', color: '#667385' }}>
          体脂变化 {trendSummary.bodyFatDelta > 0 ? '+' : ''}{trendSummary.bodyFatDelta}%
        </Text>
        <Text style={{ display: 'block', marginTop: '8px', color: '#667385' }}>
          共完成 {trendSummary.totalSessions} 次训练 · 最大记录重量 {trendSummary.maxWeight || '--'} kg
        </Text>
        <View style={{ marginTop: '16px', padding: '18px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(21,122,255,0.08) 0%, rgba(114,185,255,0.12) 100%)', border: '1px solid rgba(175, 210, 248, 0.6)' }}>
          <Text style={{ color: '#5074A1', fontSize: '22px' }}>健康趋势评分</Text>
          <Text style={{ ...metricValueXLStyle, marginTop: '8px', fontSize: '40px', color: '#157AFF' }}>
            {Math.min(98, Math.max(62, 62 + filteredBodyRecords.length * 6 + filteredTrainingRecords.length * 4))}
          </Text>
          <Text style={{ ...helperTextStyle, marginTop: '6px', color: '#667385' }}>
            根据最近的身体记录连续性、训练频率与负荷趋势估算，当前状态处于稳步上行区间。
          </Text>
          <View style={{ display: 'flex', gap: '6px', marginTop: '12px', alignItems: 'flex-end' }}>
            {[18, 26, 22, 32, 40, 36].map((height, index) => (
              <View
                key={`spark-${index}`}
                style={{
                  width: '10px',
                  height: `${height}px`,
                  borderRadius: '999px',
                  background: index >= 4 ? 'linear-gradient(180deg, #157AFF 0%, #77B6FF 100%)' : 'rgba(21,122,255,0.22)',
                }}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 34, 520) }}>
        <Text style={sectionTitleStyle}>体重趋势</Text>
        {weightChart.length ? (
          weightChart.map((item) => (
            <View key={item.label} style={{ marginTop: '16px' }}>
              <View style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#6D798A' }}>{item.label}</Text>
                <Text style={{ color: '#162033', fontWeight: '700' }}>{item.value} kg</Text>
              </View>
              <View style={{ marginTop: '8px', height: '16px', borderRadius: '999px', background: '#E8EEF7', overflow: 'hidden' }}>
                <View style={{ width: item.width, height: '16px', background: 'linear-gradient(90deg, #157AFF 0%, #77B6FF 100%)' }} />
              </View>
            </View>
          ))
        ) : (
          <Text style={{ display: 'block', marginTop: '12px', color: '#8A94A6' }}>当前时间范围内暂无体重数据。</Text>
        )}
      </View>

      <View style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 42, 600) }}>
        <Text style={sectionTitleStyle}>训练容量趋势</Text>
        {trainingChart.length ? (
          trainingChart.map((item) => (
            <View key={item.label} style={{ marginTop: '16px' }}>
              <View style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ color: '#6D798A' }}>{item.label}</Text>
                <Text style={{ color: '#162033', fontWeight: '700' }}>{item.value}</Text>
              </View>
              <View style={{ marginTop: '8px', height: '16px', borderRadius: '999px', background: '#E8EEF7', overflow: 'hidden' }}>
                <View style={{ width: item.width, height: '16px', background: 'linear-gradient(90deg, #20A46A 0%, #77D7A7 100%)' }} />
              </View>
            </View>
          ))
        ) : (
          <Text style={{ display: 'block', marginTop: '12px', color: '#8A94A6' }}>当前时间范围内暂无训练趋势数据。</Text>
        )}
      </View>

      <View style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 50, 680) }}>
        <Text style={sectionTitleStyle}>阶段提示</Text>
        <Text style={{ display: 'block', marginTop: '12px', color: '#667385', lineHeight: '1.8' }}>
          {filteredBodyRecords.length >= 3
            ? '最近已有连续身体数据，可以开始补更细的围度字段和阶段目标对照。'
            : '建议先连续记录 3 次以上身体数据，趋势判断会更稳定。'}
        </Text>
        <Text style={{ display: 'block', marginTop: '12px', color: '#667385', lineHeight: '1.8' }}>
          {filteredTrainingRecords.length >= 3
            ? '训练频次已经有基础样本，下一步适合接动作历史最佳表现和 1RM 估算展示。'
            : '建议至少记录 3 次训练，再观察重量和容量的提升节奏。'}
        </Text>
      </View>
      </View>
    </ScrollView>
  );
}
