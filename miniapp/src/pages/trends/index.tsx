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
const darkPanelShadow = '0 10px 20px rgba(19,32,51,0.14)';

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
      <View style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 18, 360), background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(243,248,255,0.96) 42%, rgba(226,236,249,0.96) 100%)', position: 'relative', overflow: 'hidden', padding: '18px 18px 16px' }}>
        <View style={{ position: 'absolute', top: '-70px', right: '-10px', width: '188px', height: '188px', borderRadius: '94px', background: 'radial-gradient(circle, rgba(21,122,255,0.18) 0%, rgba(21,122,255,0.06) 38%, rgba(21,122,255,0) 72%)' }} />
        <View style={{ position: 'absolute', left: '-42px', bottom: '-60px', width: '150px', height: '150px', borderRadius: '75px', background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 52%, rgba(255,255,255,0) 74%)' }} />
        <View style={{ position: 'relative', zIndex: 1 }}>
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ display: 'block', fontSize: '14px', letterSpacing: '0.24em', color: '#7A97BE' }}>TREND OVERVIEW</Text>
            <Text style={{ ...pageHeroTitleStyle, marginTop: '6px', fontSize: '40px', lineHeight: '1.02', color: '#132033' }}>趋势总览</Text>
          </View>
          <View style={{ padding: '7px 11px', borderRadius: '999px', background: 'rgba(255,255,255,0.66)', border: '1px solid rgba(255,255,255,0.84)' }}>
            <Text style={{ color: '#4C78AE', fontSize: '15px', fontWeight: '600', letterSpacing: '0.1em' }}>RANGE</Text>
          </View>
        </View>
        <Text style={{ ...pageHeroSubtitleStyle, marginTop: '8px', color: '#5B6B83', maxWidth: '560px', lineHeight: '1.6', fontSize: '18px' }}>
          在同一条时间轴里回看体重、体脂与训练负荷，让变化不只被感觉到，也能被清楚看见。
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
      </View>

      <View style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 26, 440), padding: '16px 16px 14px' }}>
        <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <Text style={sectionEyebrowStyle}>TREND SNAPSHOT</Text>
            <Text style={sectionHeadingStyle}>阶段摘要</Text>
          </View>
          <View style={sectionMetaWrapStyle}>
            <View style={sectionMetaLineStyle} />
            <Text style={sectionMetaTextStyle}>SCORE</Text>
          </View>
        </View>
        <View style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
          <View style={{ flex: 1.05, padding: '16px 16px 14px', borderRadius: '999px 28px 999px 999px', background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(246,250,255,0.94) 100%)', border: '1px solid rgba(213, 221, 232, 0.76)', boxShadow: lightPanelShadow }}>
            <Text style={{ color: '#6F88A8', fontSize: '14px', letterSpacing: '0.14em' }}>CURRENT</Text>
            <Text style={{ ...metricValueXLStyle, marginTop: '8px', fontSize: '40px', color: '#157AFF', lineHeight: '1' }}>{trendSummary.currentWeight || '--'} kg</Text>
            <Text style={{ display: 'block', marginTop: '8px', color: '#6D7686', fontSize: '16px', lineHeight: '1.55' }}>
              体重 {trendSummary.weightDelta > 0 ? '+' : ''}{trendSummary.weightDelta} kg · 体脂 {trendSummary.bodyFatDelta > 0 ? '+' : ''}{trendSummary.bodyFatDelta}%
            </Text>
          </View>
          <View style={{ flex: 0.95, padding: '16px 16px 14px', borderRadius: '24px 999px 999px 999px', background: 'linear-gradient(145deg, rgba(19,32,51,0.9) 0%, rgba(37,58,89,0.92) 100%)', border: '1px solid rgba(49, 72, 108, 0.66)', boxShadow: darkPanelShadow }}>
            <Text style={{ color: 'rgba(196,216,244,0.82)', fontSize: '14px', letterSpacing: '0.14em' }}>MOMENTUM</Text>
            <Text style={{ display: 'block', marginTop: '8px', fontSize: '34px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1' }}>{Math.min(98, Math.max(62, 62 + filteredBodyRecords.length * 6 + filteredTrainingRecords.length * 4))}</Text>
            <Text style={{ display: 'block', marginTop: '8px', color: 'rgba(226,236,247,0.76)', fontSize: '16px', lineHeight: '1.55' }}>训练 {trendSummary.totalSessions} 次 · 最大重量 {trendSummary.maxWeight || '--'} kg</Text>
          </View>
        </View>
        <View style={{ marginTop: '12px', padding: '12px 14px', borderRadius: '999px 24px 999px 999px', background: 'linear-gradient(135deg, rgba(236,246,255,0.96) 0%, rgba(246,251,255,0.92) 100%)', border: '1px solid rgba(210, 224, 244, 0.76)', boxShadow: lightPanelShadow }}>
          <Text style={{ color: '#5074A1', fontSize: '16px', lineHeight: '1.55' }}>你的趋势正在被稳定记录，越连续的输入，越能看出真正属于自己的节奏。</Text>
        </View>
      </View>

      <View style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 34, 520), padding: '16px 16px 14px' }}>
        <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <Text style={sectionEyebrowStyle}>BODY WEIGHT</Text>
            <Text style={sectionHeadingStyle}>体重趋势</Text>
          </View>
          <View style={sectionMetaWrapStyle}>
            <View style={sectionMetaLineStyle} />
            <Text style={sectionMetaTextStyle}>TREND</Text>
          </View>
        </View>
        {weightChart.length ? (
          weightChart.map((item) => (
            <View key={item.label} style={{ marginTop: '14px', padding: '12px 14px', borderRadius: '999px 24px 999px 999px', background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(246,250,255,0.94) 100%)', border: '1px solid rgba(213, 221, 232, 0.76)', boxShadow: lightPanelShadow }}>
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
          <View style={{ marginTop: '14px', padding: '12px 14px', borderRadius: '999px 24px 999px 999px', background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(246,250,255,0.94) 100%)', border: '1px solid rgba(213, 221, 232, 0.76)', boxShadow: lightPanelShadow }}>
            <Text style={{ color: '#8A94A6' }}>这个时间范围里还没有留下体重记录，第一条数据会让趋势开始说话。</Text>
          </View>
        )}
      </View>

      <View style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 42, 600), padding: '16px 16px 14px' }}>
        <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <Text style={sectionEyebrowStyle}>TRAINING VOLUME</Text>
            <Text style={sectionHeadingStyle}>训练容量趋势</Text>
          </View>
          <View style={sectionMetaWrapStyle}>
            <View style={sectionMetaLineStyle} />
            <Text style={sectionMetaTextStyle}>POWER</Text>
          </View>
        </View>
        {trainingChart.length ? (
          trainingChart.map((item) => (
            <View key={item.label} style={{ marginTop: '14px', padding: '12px 14px', borderRadius: '24px 999px 999px 999px', background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(246,250,255,0.94) 100%)', border: '1px solid rgba(213, 221, 232, 0.76)', boxShadow: lightPanelShadow }}>
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
          <View style={{ marginTop: '14px', padding: '12px 14px', borderRadius: '24px 999px 999px 999px', background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(246,250,255,0.94) 100%)', border: '1px solid rgba(213, 221, 232, 0.76)', boxShadow: lightPanelShadow }}>
            <Text style={{ color: '#8A94A6' }}>这个时间范围里还没有训练容量数据，留下一次训练，力量的轨迹就会开始出现。</Text>
          </View>
        )}
      </View>

      <View style={{ ...cardStyle, ...createPressableCardStyle(), ...createEnterStyle(entered, 50, 680), padding: '16px 16px 14px' }}>
        <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <Text style={sectionEyebrowStyle}>INSIGHTS</Text>
            <Text style={sectionHeadingStyle}>阶段提示</Text>
          </View>
          <View style={sectionMetaWrapStyle}>
            <View style={sectionMetaLineStyle} />
            <Text style={sectionMetaTextStyle}>NEXT</Text>
          </View>
        </View>
        <View style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
          <View style={{ padding: '12px 14px', borderRadius: '999px 24px 999px 999px', background: 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(248,251,255,0.94) 100%)', border: '1px solid rgba(212, 223, 240, 0.8)', boxShadow: lightPanelShadow }}>
            <Text style={{ color: '#5C6678', lineHeight: '1.6' }}>
              {filteredBodyRecords.length >= 3
                ? '身体数据已经开始连成线，下一步适合把围度与目标一起纳入观察。'
                : '连续留下 3 次以上身体记录后，趋势会比单次变化更有说服力。'}
            </Text>
          </View>
          <View style={{ padding: '12px 14px', borderRadius: '24px 999px 999px 999px', background: 'linear-gradient(135deg, rgba(236,250,242,0.98) 0%, rgba(244,255,248,0.94) 100%)', border: '1px solid rgba(193, 230, 210, 0.84)', boxShadow: lightPanelShadow }}>
            <Text style={{ color: '#327157', lineHeight: '1.6' }}>
              {filteredTrainingRecords.length >= 3
                ? '训练频率已经形成样本，接下来更适合观察动作表现与容量抬升。'
                : '当训练样本再多一些，你会更容易看见力量与容量的真实走向。'}
            </Text>
          </View>
        </View>
      </View>
      </View>
    </ScrollView>
  );
}
