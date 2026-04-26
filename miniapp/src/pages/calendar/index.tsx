import Taro from '@tarojs/taro';
import { Button, ScrollView, Text, View } from '@tarojs/components';
import { useEffect, useMemo, useState } from 'react';
import { fetchDashboardOverview } from '@/services/modules/dashboard';
import { BodyRecordPayload, TrainingSessionPayload } from '@/types/api';
import { helperTextStyle, metricValueLargeStyle, pageHeroSubtitleStyle, pageHeroTitleStyle, tokens } from '@/utils/design';

type CalendarItem = {
  date: string;
  body?: BodyRecordPayload;
  training?: TrainingSessionPayload;
};

type RangeKey = '7d' | '14d' | '30d';

const rangeMap: Record<RangeKey, number> = {
  '7d': 7,
  '14d': 14,
  '30d': 30,
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
  marginBottom: '20px',
  border: '1px solid rgba(255, 255, 255, 0.72)',
  boxShadow: '0 18px 42px rgba(124, 140, 171, 0.14)',
};

const sectionTitleStyle = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#162033',
  letterSpacing: '-0.02em',
};

function buildDateRange(days: number) {
  const dates: string[] = [];
  for (let i = 0; i < days; i += 1) {
    const current = new Date();
    current.setDate(current.getDate() - i);
    dates.push(current.toISOString().slice(0, 10));
  }
  return dates;
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

export default function CalendarPage() {
  const [range, setRange] = useState<RangeKey>('14d');
  const [bodyRecords, setBodyRecords] = useState<BodyRecordPayload[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<TrainingSessionPayload[]>([]);
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
        Taro.showToast({ title: '日历数据加载失败', icon: 'none' });
      }
    };

    void load();
  }, [range]);

  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 40);
    return () => clearTimeout(timer);
  }, []);

  const calendarItems = useMemo(() => {
    const dates = buildDateRange(rangeMap[range]);

    return dates.map((date) => ({
      date,
      body: bodyRecords.find((item) => item.recordDate.slice(0, 10) === date),
      training: trainingRecords.find((item) => item.sessionDate.slice(0, 10) === date),
    }));
  }, [bodyRecords, range, trainingRecords]);

  const stats = useMemo(() => {
    const totalBody = calendarItems.filter((item) => item.body).length;
    const totalTraining = calendarItems.filter((item) => item.training).length;
    const both = calendarItems.filter((item) => item.body && item.training).length;
    return { totalBody, totalTraining, both };
  }, [calendarItems]);

  return (
    <ScrollView scrollY style={pageStyle}>
      <View style={pageContentStyle}>
      <View style={{ ...cardStyle, background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(243,248,255,0.96) 42%, rgba(226,236,249,0.96) 100%)', position: 'relative', overflow: 'hidden', padding: '18px 18px 16px', transform: entered ? 'translateY(0)' : 'translateY(18px)', opacity: entered ? '1' : '0.01', transition: 'all 360ms ease' }}>
        <View style={{ position: 'absolute', top: '-70px', right: '-10px', width: '188px', height: '188px', borderRadius: '94px', background: 'radial-gradient(circle, rgba(21,122,255,0.18) 0%, rgba(21,122,255,0.06) 38%, rgba(21,122,255,0) 72%)' }} />
        <View style={{ position: 'absolute', left: '-42px', bottom: '-60px', width: '150px', height: '150px', borderRadius: '75px', background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 52%, rgba(255,255,255,0) 74%)' }} />
        <View style={{ position: 'relative', zIndex: 1 }}>
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ display: 'block', fontSize: '14px', letterSpacing: '0.24em', color: '#7A97BE' }}>TRAINING CALENDAR</Text>
            <Text style={{ ...pageHeroTitleStyle, marginTop: '6px', fontSize: '40px', lineHeight: '1.02', color: '#132033' }}>训练日历</Text>
          </View>
          <View style={{ padding: '7px 11px', borderRadius: '999px', background: 'rgba(255,255,255,0.66)', border: '1px solid rgba(255,255,255,0.84)' }}>
            <Text style={{ color: '#4C78AE', fontSize: '15px', fontWeight: '600', letterSpacing: '0.1em' }}>WINDOW</Text>
          </View>
        </View>
        <Text style={{ ...pageHeroSubtitleStyle, marginTop: '8px', color: '#5B6B83', lineHeight: '1.6', fontSize: '18px', maxWidth: '560px' }}>
          用同一张时间网格回看记录与训练，把节奏、空白与坚持都清楚放在眼前。
        </Text>
        <View style={{ display: 'flex', gap: '12px', marginTop: '18px' }}>
          {(['7d', '14d', '30d'] as RangeKey[]).map((item) => (
            <Button
              key={item}
              style={{
                background: item === range ? 'linear-gradient(135deg, #157AFF 0%, #55A3FF 100%)' : 'rgba(240, 244, 252, 0.96)',
                color: item === range ? '#FFFFFF' : '#576476',
                borderRadius: '999px',
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

      <View style={{ ...cardStyle, transform: entered ? 'translateY(0)' : 'translateY(26px)', opacity: entered ? '1' : '0.01', transition: 'all 440ms ease', padding: '16px 16px 14px' }}>
        <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <Text style={sectionEyebrowStyle}>CONSISTENCY SNAPSHOT</Text>
            <Text style={sectionHeadingStyle}>阶段统计</Text>
          </View>
          <View style={sectionMetaWrapStyle}>
            <View style={sectionMetaLineStyle} />
            <Text style={sectionMetaTextStyle}>RHYTHM</Text>
          </View>
        </View>
        <View style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
          <View style={{ flex: 1, padding: '16px 16px 14px', borderRadius: '999px 28px 999px 999px', background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(246,250,255,0.94) 100%)', border: '1px solid rgba(213, 221, 232, 0.76)', boxShadow: lightPanelShadow }}>
            <Text style={{ color: '#6F88A8', fontSize: '14px', letterSpacing: '0.14em' }}>BODY</Text>
            <Text style={{ ...metricValueLargeStyle, fontSize: '34px', color: '#157AFF' }}>{stats.totalBody}</Text>
            <Text style={{ color: '#6D7686', fontSize: '16px' }}>身体记录天数</Text>
          </View>
          <View style={{ flex: 1, padding: '16px 16px 14px', borderRadius: '24px 999px 999px 999px', background: 'linear-gradient(145deg, rgba(19,32,51,0.9) 0%, rgba(37,58,89,0.92) 100%)', border: '1px solid rgba(49, 72, 108, 0.66)', boxShadow: darkPanelShadow }}>
            <Text style={{ color: 'rgba(196,216,244,0.82)', fontSize: '14px', letterSpacing: '0.14em' }}>TRAINING</Text>
            <Text style={{ ...metricValueLargeStyle, fontSize: '34px', color: '#FFFFFF' }}>{stats.totalTraining}</Text>
            <Text style={{ color: 'rgba(226,236,247,0.76)', fontSize: '16px' }}>训练打卡天数</Text>
          </View>
        </View>
        <View style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
          <View style={{ flex: 0.9, padding: '14px 14px 12px', borderRadius: '999px 999px 24px 999px', background: 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(250,246,255,0.92) 100%)', border: '1px solid rgba(223, 216, 247, 0.82)', boxShadow: lightPanelShadow }}>
            <Text style={{ color: '#7A6BA5', fontSize: '14px', letterSpacing: '0.14em' }}>CLOSURE</Text>
            <Text style={{ ...metricValueLargeStyle, fontSize: '34px', color: '#352D57' }}>{stats.both}</Text>
            <Text style={{ color: '#6D7686', fontSize: '16px' }}>双记录完成天数</Text>
          </View>
          <View style={{ flex: 1.1, padding: '14px 14px 12px', borderRadius: '999px 999px 999px 24px', background: 'linear-gradient(135deg, rgba(236,246,255,0.96) 0%, rgba(246,251,255,0.92) 100%)', border: '1px solid rgba(210, 224, 244, 0.76)', boxShadow: lightPanelShadow }}>
            <Text style={{ color: '#5074A1', fontSize: '14px', letterSpacing: '0.14em' }}>INSIGHT</Text>
            <Text style={{ color: tokens.textSecondary, fontSize: '16px', lineHeight: '1.6', marginTop: '8px' }}>
              最近 {rangeMap[range]} 天里，你有 {stats.both} 天完成了双记录闭环，越接近每日完整记录，趋势越有判断价值。
            </Text>
          </View>
        </View>
      </View>

      <View style={{ ...cardStyle, transform: entered ? 'translateY(0)' : 'translateY(34px)', opacity: entered ? '1' : '0.01', transition: 'all 520ms ease', padding: '16px 16px 14px' }}>
        <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <Text style={sectionEyebrowStyle}>DAY BY DAY</Text>
            <Text style={sectionHeadingStyle}>按日查看</Text>
          </View>
          <View style={sectionMetaWrapStyle}>
            <View style={sectionMetaLineStyle} />
            <Text style={sectionMetaTextStyle}>GRID</Text>
          </View>
        </View>
        {calendarItems.map((item) => (
          <View key={item.date} style={{ marginTop: '14px', padding: '16px 16px 14px', borderRadius: item.body && item.training ? '24px 999px 999px 999px' : '999px 24px 999px 999px', background: item.body && item.training ? 'linear-gradient(135deg, #EDF9F2 0%, #F7FFF9 100%)' : 'linear-gradient(135deg, #FFFFFF 0%, #F4F8FF 100%)', border: item.body && item.training ? '1px solid rgba(202, 232, 216, 0.88)' : '1px solid rgba(210, 224, 244, 0.76)', boxShadow: lightPanelShadow }}>
            <Text style={{ display: 'block', fontWeight: '700', color: '#162033' }}>{item.date}</Text>
            <Text style={{ display: 'block', marginTop: '8px', color: '#667385' }}>
              身体记录：{item.body ? `已完成 · ${item.body.weightKg || '-'} kg / ${item.body.bodyFatRate || '-'}%` : '未记录'}
            </Text>
            <Text style={{ display: 'block', marginTop: '8px', color: '#667385' }}>
              训练记录：{item.training ? `已完成 · ${item.training.bodyPart} / ${item.training.exercises?.[0]?.name || '本次训练动作'}` : '未记录'}
            </Text>
            <Text style={{ display: 'block', marginTop: '8px', color: '#8893A5' }}>
              {item.body && item.training ? '今天的记录已经完整留住。' : item.body || item.training ? '今天已经开始了一半，把另一条也补上会更完整。' : '今天还没有留下记录，节奏就从这一刻开始。'}
            </Text>
          </View>
        ))}
      </View>
      </View>
    </ScrollView>
  );
}
