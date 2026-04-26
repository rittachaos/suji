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
      <View style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(236,244,255,0.88) 58%, rgba(219,232,250,0.95) 100%)', transform: entered ? 'translateY(0)' : 'translateY(18px)', opacity: entered ? '1' : '0.01', transition: 'all 360ms ease' }}>
        <Text style={pageHeroTitleStyle}>训练日历</Text>
        <Text style={{ ...pageHeroSubtitleStyle, marginTop: '10px' }}>
          现在可以按天查看身体记录和训练记录是否完成，方便回看打卡节奏和补录空白日期。
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

      <View style={{ ...cardStyle, transform: entered ? 'translateY(0)' : 'translateY(26px)', opacity: entered ? '1' : '0.01', transition: 'all 440ms ease' }}>
        <Text style={sectionTitleStyle}>阶段统计</Text>
        <View style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
          <View style={{ flex: 1, padding: '18px', borderRadius: '24px', background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F9FF 100%)', border: '1px solid rgba(210, 224, 244, 0.7)' }}>
            <Text style={{ color: '#6F88A8' }}>身体记录天数</Text>
            <Text style={{ ...metricValueLargeStyle, fontSize: '34px', color: '#157AFF' }}>{stats.totalBody}</Text>
          </View>
          <View style={{ flex: 1, padding: '18px', borderRadius: '24px', background: 'linear-gradient(135deg, #FFFFFF 0%, #F1F7F4 100%)', border: '1px solid rgba(208, 228, 217, 0.7)' }}>
            <Text style={{ color: '#5B8572' }}>训练打卡天数</Text>
            <Text style={{ ...metricValueLargeStyle, fontSize: '34px', color: '#20A46A' }}>{stats.totalTraining}</Text>
          </View>
        </View>
        <View style={{ marginTop: '12px', padding: '18px', borderRadius: '24px', background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FD 100%)', border: '1px solid rgba(221, 226, 236, 0.8)' }}>
          <Text style={{ color: '#71829A' }}>双记录完成天数</Text>
          <Text style={{ ...metricValueLargeStyle, fontSize: '34px', color: '#162033' }}>{stats.both}</Text>
        </View>
        <View style={{ marginTop: '14px', padding: '18px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(21,122,255,0.08) 0%, rgba(114,185,255,0.12) 100%)', border: '1px solid rgba(175, 210, 248, 0.6)' }}>
          <Text style={{ color: '#5074A1', fontSize: '22px' }}>连续性洞察</Text>
          <Text style={{ ...helperTextStyle, marginTop: '8px', color: tokens.textSecondary }}>
            最近 {rangeMap[range]} 天中，你有 {stats.both} 天完成了双记录闭环，越接近每日双记录，趋势越有判断价值。
          </Text>
        </View>
      </View>

      <View style={{ ...cardStyle, transform: entered ? 'translateY(0)' : 'translateY(34px)', opacity: entered ? '1' : '0.01', transition: 'all 520ms ease' }}>
        <Text style={sectionTitleStyle}>按日查看</Text>
        {calendarItems.map((item) => (
          <View key={item.date} style={{ marginTop: '16px', padding: '18px', borderRadius: '24px', background: item.body && item.training ? 'linear-gradient(135deg, #EDF9F2 0%, #F7FFF9 100%)' : 'linear-gradient(135deg, #FFFFFF 0%, #F4F8FF 100%)', border: item.body && item.training ? '1px solid rgba(202, 232, 216, 0.88)' : '1px solid rgba(210, 224, 244, 0.76)' }}>
            <Text style={{ display: 'block', fontWeight: '700', color: '#162033' }}>{item.date}</Text>
            <Text style={{ display: 'block', marginTop: '8px', color: '#667385' }}>
              身体记录：{item.body ? `已完成 · ${item.body.weightKg || '-'} kg / ${item.body.bodyFatRate || '-'}%` : '未记录'}
            </Text>
            <Text style={{ display: 'block', marginTop: '8px', color: '#667385' }}>
              训练记录：{item.training ? `已完成 · ${item.training.bodyPart} / ${item.training.exercises?.[0]?.name || '未填动作'}` : '未记录'}
            </Text>
            <Text style={{ display: 'block', marginTop: '8px', color: '#8893A5' }}>
              {item.body && item.training ? '今天是完整打卡日。' : item.body || item.training ? '今天只完成了一半，适合补另外一条记录。' : '今天还没有记录，可以去补录。'}
            </Text>
          </View>
        ))}
      </View>
      </View>
    </ScrollView>
  );
}
