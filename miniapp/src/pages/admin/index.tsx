import Taro from '@tarojs/taro';
import { Button, Input, Picker, ScrollView, Text, Textarea, View } from '@tarojs/components';
import { useEffect, useMemo, useState } from 'react';
import {
  createAdminRelation,
  fetchAdminCoachApplications,
  fetchAdminRelations,
  fetchAdminUsers,
  reviewCoachApplication,
} from '@/services/modules/admin';
import { useUserStore } from '@/store/user';

type AdminUser = {
  id: string;
  nickname?: string;
  role: 'USER' | 'COACH' | 'ADMIN';
  phone?: string;
};

type CoachApplication = {
  id: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  user?: AdminUser;
};

type Relation = {
  id: string;
  coach?: AdminUser;
  student?: AdminUser;
  note?: string;
};

type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

const roleOptions = ['ALL', 'USER', 'COACH', 'ADMIN'];
const statusOptions = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

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

const inputStyle = {
  background: 'rgba(255, 255, 255, 0.94)',
  borderRadius: '20px',
  padding: '18px 20px',
  marginTop: '10px',
  border: '1px solid rgba(205, 217, 234, 0.84)',
};

const pillStyle = {
  background: 'rgba(240, 244, 252, 0.96)',
  color: '#536173',
  borderRadius: '999px',
  border: '1px solid rgba(203, 214, 230, 0.82)',
};

const primaryButtonStyle = {
  background: 'linear-gradient(135deg, #157AFF 0%, #55A3FF 100%)',
  color: '#FFFFFF',
  borderRadius: '999px',
  boxShadow: '0 12px 26px rgba(21, 122, 255, 0.22)',
};

const successButtonStyle = {
  background: 'linear-gradient(135deg, #20A46A 0%, #67D597 100%)',
  color: '#FFFFFF',
  borderRadius: '999px',
  boxShadow: '0 12px 26px rgba(32, 164, 106, 0.2)',
};

const sectionTitleStyle = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#162033',
  letterSpacing: '-0.02em',
};

export default function AdminPage() {
  const { user } = useUserStore();
  const [entered, setEntered] = useState(false);
  const [users, setUsers] = useState<PagedResult<AdminUser>>({ items: [], total: 0, page: 1, pageSize: 8 });
  const [applications, setApplications] = useState<PagedResult<CoachApplication>>({ items: [], total: 0, page: 1, pageSize: 6 });
  const [relations, setRelations] = useState<PagedResult<Relation>>({ items: [], total: 0, page: 1, pageSize: 6 });
  const [loading, setLoading] = useState(false);
  const [userKeyword, setUserKeyword] = useState('');
  const [userRole, setUserRole] = useState('ALL');
  const [applicationKeyword, setApplicationKeyword] = useState('');
  const [applicationStatus, setApplicationStatus] = useState('PENDING');
  const [relationKeyword, setRelationKeyword] = useState('');
  const [relationForm, setRelationForm] = useState({ coachId: '', studentId: '', note: '' });

  const coachCandidates = useMemo(() => users.items.filter((item) => item.role === 'COACH' || item.role === 'ADMIN'), [users.items]);
  const studentCandidates = useMemo(() => users.items.filter((item) => item.role === 'USER'), [users.items]);

  const load = async () => {
    setLoading(true);
    try {
      const [userRes, applicationRes, relationRes] = (await Promise.all([
        fetchAdminUsers({ keyword: userKeyword, role: userRole === 'ALL' ? '' : userRole, page: users.page, pageSize: users.pageSize }),
        fetchAdminCoachApplications({
          keyword: applicationKeyword,
          status: applicationStatus === 'ALL' ? '' : applicationStatus,
          page: applications.page,
          pageSize: applications.pageSize,
        }),
        fetchAdminRelations({ keyword: relationKeyword, page: relations.page, pageSize: relations.pageSize }),
      ])) as [PagedResult<AdminUser>, PagedResult<CoachApplication>, PagedResult<Relation>];

      setUsers(userRes);
      setApplications(applicationRes);
      setRelations(relationRes);
    } catch {
      Taro.showToast({ title: '管理数据加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      void load();
    }
  }, [user?.role, userKeyword, userRole, applicationKeyword, applicationStatus, relationKeyword, users.page, applications.page, relations.page]);

  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 40);
    return () => clearTimeout(timer);
  }, []);

  if (user?.role !== 'ADMIN') {
    return (
      <View style={{ padding: '32px' }}>
        <Text>当前账号不是管理员，无法进入管理台。</Text>
      </View>
    );
  }

  return (
    <ScrollView scrollY style={pageStyle}>
      <View style={pageContentStyle}>
        <View style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(236,244,255,0.88) 58%, rgba(219,232,250,0.95) 100%)', transform: entered ? 'translateY(0)' : 'translateY(18px)', opacity: entered ? '1' : '0.01', transition: 'all 360ms ease' }}>
          <Text style={{ display: 'block', fontSize: '36px', fontWeight: '700', color: '#101828', letterSpacing: '-0.04em' }}>管理台</Text>
          <Text style={{ display: 'block', marginTop: '8px', color: '#607086' }}>现在可以筛选、搜索并分页查看用户、教练申请和学员关系。</Text>
        </View>

        <View style={{ ...cardStyle, transform: entered ? 'translateY(0)' : 'translateY(26px)', opacity: entered ? '1' : '0.01', transition: 'all 440ms ease' }}>
          <Text style={sectionTitleStyle}>教练申请审批</Text>
          <Input style={inputStyle} value={applicationKeyword} onInput={(e) => { setApplications((prev) => ({ ...prev, page: 1 })); setApplicationKeyword(e.detail.value); }} placeholder='搜索申请理由 / 用户昵称' />
          <Picker mode='selector' range={statusOptions} onChange={(e) => { setApplications((prev) => ({ ...prev, page: 1 })); setApplicationStatus(statusOptions[Number(e.detail.value)]); }}>
            <View style={inputStyle}><Text>状态筛选：{applicationStatus}</Text></View>
          </Picker>
          {applications.items.map((item) => (
            <View key={item.id} style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(218, 226, 239, 0.82)' }}>
              <Text style={{ color: '#162033', fontWeight: '700' }}>{item.user?.nickname || item.user?.id}</Text>
              <Text style={{ display: 'block', marginTop: '6px', color: '#607086' }}>状态：{item.status}</Text>
              <Text style={{ display: 'block', marginTop: '6px', color: '#607086' }}>{item.reason}</Text>
              {item.status === 'PENDING' && (
                <View style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <Button style={successButtonStyle} onClick={() => void reviewCoachApplication(item.id, { status: 'APPROVED' }).then(load)}>
                    通过
                  </Button>
                  <Button style={primaryButtonStyle} onClick={() => void reviewCoachApplication(item.id, { status: 'REJECTED', reviewNote: '当前资料暂不满足审批要求' }).then(load)}>
                    驳回
                  </Button>
                </View>
              )}
            </View>
          ))}
          <View style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <Button style={pillStyle} disabled={applications.page <= 1} onClick={() => setApplications((prev) => ({ ...prev, page: prev.page - 1 }))}>上一页</Button>
            <Button style={pillStyle} disabled={applications.page * applications.pageSize >= applications.total} onClick={() => setApplications((prev) => ({ ...prev, page: prev.page + 1 }))}>下一页</Button>
          </View>
        </View>

        <View style={{ ...cardStyle, transform: entered ? 'translateY(0)' : 'translateY(34px)', opacity: entered ? '1' : '0.01', transition: 'all 520ms ease' }}>
          <Text style={sectionTitleStyle}>学员关系管理</Text>
          <Input style={inputStyle} value={relationKeyword} onInput={(e) => { setRelations((prev) => ({ ...prev, page: 1 })); setRelationKeyword(e.detail.value); }} placeholder='搜索关系备注 / 用户昵称' />
          <Picker mode='selector' range={coachCandidates.map((item) => `${item.nickname || item.id} (${item.id.slice(0, 6)})`)} onChange={(e) => setRelationForm({ ...relationForm, coachId: coachCandidates[Number(e.detail.value)]?.id || '' })}>
            <View style={inputStyle}><Text>{relationForm.coachId ? `已选教练：${relationForm.coachId}` : '选择教练'}</Text></View>
          </Picker>
          <Picker mode='selector' range={studentCandidates.map((item) => `${item.nickname || item.id} (${item.id.slice(0, 6)})`)} onChange={(e) => setRelationForm({ ...relationForm, studentId: studentCandidates[Number(e.detail.value)]?.id || '' })}>
            <View style={inputStyle}><Text>{relationForm.studentId ? `已选学员：${relationForm.studentId}` : '选择学员'}</Text></View>
          </Picker>
          <Textarea style={{ ...inputStyle, minHeight: '120px' }} value={relationForm.note} onInput={(e) => setRelationForm({ ...relationForm, note: e.detail.value })} placeholder='关系备注' />
          <Button
            style={{ ...primaryButtonStyle, marginTop: '16px' }}
            loading={loading}
            onClick={() =>
              void createAdminRelation(relationForm).then(async () => {
                Taro.showToast({ title: '关系已创建', icon: 'success' });
                setRelationForm({ coachId: '', studentId: '', note: '' });
                await load();
              })
            }
          >
            创建学员关系
          </Button>
          {relations.items.map((item) => (
            <View key={item.id} style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(218, 226, 239, 0.82)' }}>
              <Text style={{ color: '#162033' }}>{item.coach?.nickname || item.coach?.id} → {item.student?.nickname || item.student?.id}</Text>
              <Text style={{ display: 'block', marginTop: '6px', color: '#607086' }}>{item.note || '无备注'}</Text>
            </View>
          ))}
          <View style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <Button style={pillStyle} disabled={relations.page <= 1} onClick={() => setRelations((prev) => ({ ...prev, page: prev.page - 1 }))}>上一页</Button>
            <Button style={pillStyle} disabled={relations.page * relations.pageSize >= relations.total} onClick={() => setRelations((prev) => ({ ...prev, page: prev.page + 1 }))}>下一页</Button>
          </View>
        </View>

        <View style={{ ...cardStyle, transform: entered ? 'translateY(0)' : 'translateY(42px)', opacity: entered ? '1' : '0.01', transition: 'all 600ms ease' }}>
          <Text style={sectionTitleStyle}>用户列表</Text>
          <Input style={inputStyle} value={userKeyword} onInput={(e) => { setUsers((prev) => ({ ...prev, page: 1 })); setUserKeyword(e.detail.value); }} placeholder='搜索昵称 / 手机 / ID' />
          <Picker mode='selector' range={roleOptions} onChange={(e) => { setUsers((prev) => ({ ...prev, page: 1 })); setUserRole(roleOptions[Number(e.detail.value)]); }}>
            <View style={inputStyle}><Text>角色筛选：{userRole}</Text></View>
          </Picker>
          {users.items.map((item) => (
            <View key={item.id} style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(218, 226, 239, 0.82)' }}>
              <Text style={{ color: '#162033', fontWeight: '700' }}>{item.nickname || item.id}</Text>
              <Text style={{ display: 'block', marginTop: '6px', color: '#607086' }}>角色：{item.role} · 手机：{item.phone || '未绑定'}</Text>
            </View>
          ))}
          <View style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <Button style={pillStyle} disabled={users.page <= 1} onClick={() => setUsers((prev) => ({ ...prev, page: prev.page - 1 }))}>上一页</Button>
            <Button style={pillStyle} disabled={users.page * users.pageSize >= users.total} onClick={() => setUsers((prev) => ({ ...prev, page: prev.page + 1 }))}>下一页</Button>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
