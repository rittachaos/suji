import Taro, { useRouter } from '@tarojs/taro';
import { Button, Input, ScrollView, Text, View } from '@tarojs/components';
import { useEffect, useState } from 'react';
import { fetchCoachStudentsPaged } from '@/services/modules/coaches';
import { helperTextStyle, pageHeroSubtitleStyle, pageHeroTitleStyle, tokens } from '@/utils/design';

type StudentRelation = {
  student?: {
    id: string;
    nickname?: string;
    phone?: string;
    profile?: {
      heightCm?: number;
      trainingPhase?: string;
    };
    goal?: {
      goalType?: string;
    };
  };
};

type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
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

const primaryButtonStyle = {
  background: 'linear-gradient(135deg, #157AFF 0%, #55A3FF 100%)',
  color: '#FFFFFF',
  borderRadius: '999px',
  boxShadow: '0 12px 26px rgba(21, 122, 255, 0.22)',
};

const secondaryButtonStyle = {
  background: 'rgba(240, 244, 252, 0.96)',
  color: '#536173',
  borderRadius: '999px',
  border: '1px solid rgba(203, 214, 230, 0.82)',
};

export default function CoachStudentsPage() {
  const router = useRouter();
  const mode = router.params.mode;
  const [entered, setEntered] = useState(false);
  const [students, setStudents] = useState<PagedResult<StudentRelation>>({ items: [], total: 0, page: 1, pageSize: 8 });
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = (await fetchCoachStudentsPaged({ keyword, page: students.page, pageSize: students.pageSize })) as PagedResult<StudentRelation>;
        setStudents(result || { items: [], total: 0, page: 1, pageSize: 8 });
      } catch {
        Taro.showToast({ title: '学员加载失败', icon: 'none' });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [keyword, students.page]);

  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 40);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ScrollView scrollY style={pageStyle}>
      <View style={pageContentStyle}>
        <View style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(236,244,255,0.88) 58%, rgba(219,232,250,0.95) 100%)', transform: entered ? 'translateY(0)' : 'translateY(18px)', opacity: entered ? '1' : '0.01', transition: 'all 360ms ease' }}>
          <Text style={{ ...pageHeroTitleStyle, fontSize: '36px' }}>学员管理</Text>
          <Text style={pageHeroSubtitleStyle}>
            {mode === 'entry' ? '选择学员后可直接进入代录页。' : '先看学员概况，再进入详情和代录。'}
          </Text>
          <View style={{ marginTop: '14px', padding: '16px', borderRadius: '22px', background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(255,255,255,0.82)' }}>
            <Text style={{ color: '#5074A1', fontSize: '20px' }}>教练视角提示</Text>
            <Text style={{ ...helperTextStyle, marginTop: '8px', color: tokens.textSecondary }}>
              优先关注阶段、目标与最近训练记录，能最快判断学员是否需要补录或调整计划。
            </Text>
          </View>
          <Input
            style={{ background: 'rgba(255, 255, 255, 0.94)', borderRadius: '20px', padding: '18px 20px', marginTop: '14px', border: '1px solid rgba(205, 217, 234, 0.84)' }}
            value={keyword}
            onInput={(e) => {
              setStudents((prev) => ({ ...prev, page: 1 }));
              setKeyword(e.detail.value);
            }}
            placeholder='搜索学员昵称 / 手机 / ID'
          />
        </View>

        {students.items.map((item) => (
          <View key={item.student?.id} style={{ ...cardStyle, transform: entered ? 'translateY(0)' : 'translateY(26px)', opacity: entered ? '1' : '0.01', transition: 'all 460ms ease' }}>
            <Text style={{ display: 'block', fontSize: '28px', fontWeight: '700', color: '#162033' }}>{item.student?.nickname || item.student?.id}</Text>
            <Text style={{ display: 'block', marginTop: '8px', color: '#607086' }}>手机号：{item.student?.phone || '未绑定'}</Text>
            <Text style={{ display: 'block', marginTop: '8px', color: '#607086' }}>
              阶段：{item.student?.profile?.trainingPhase || '未填写'} · 目标：{item.student?.goal?.goalType || '未设定'}
            </Text>
            <View style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
              <Button
                style={secondaryButtonStyle}
                onClick={() => Taro.navigateTo({ url: `/pages/coach/student-detail/index?studentId=${item.student?.id}` })}
              >
                查看详情
              </Button>
              <Button
                style={primaryButtonStyle}
                onClick={() => Taro.navigateTo({ url: `/pages/coach/student-detail/index?studentId=${item.student?.id}&mode=entry` })}
              >
                代录数据
              </Button>
            </View>
          </View>
        ))}

        <View style={{ ...cardStyle, display: 'flex', gap: '12px', transform: entered ? 'translateY(0)' : 'translateY(34px)', opacity: entered ? '1' : '0.01', transition: 'all 520ms ease' }}>
          <Button style={secondaryButtonStyle} disabled={students.page <= 1} onClick={() => setStudents((prev) => ({ ...prev, page: prev.page - 1 }))}>上一页</Button>
          <Button style={secondaryButtonStyle} disabled={students.page * students.pageSize >= students.total} onClick={() => setStudents((prev) => ({ ...prev, page: prev.page + 1 }))}>下一页</Button>
        </View>

        {!students.items.length && !loading && (
          <View style={cardStyle}>
            <Text style={{ color: '#8A94A6' }}>当前还没有学员数据。</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
