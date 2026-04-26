import { BodyRecordPayload, TrainingSessionPayload } from '@/types/api';
import { request } from '../http';

export function createCoachApplication(reason: string) {
  return request<{ reason: string }, unknown>({
    url: '/coaches/applications',
    method: 'POST',
    data: { reason },
  });
}

export function fetchCoachStudents() {
  return request({ url: '/coaches/students?page=1&pageSize=20' });
}

export function fetchCoachStudentsPaged(query: { keyword?: string; page?: number; pageSize?: number } = {}) {
  const params = new URLSearchParams();
  params.append('page', String(query.page ?? 1));
  params.append('pageSize', String(query.pageSize ?? 10));
  if (query.keyword) {
    params.append('keyword', query.keyword);
  }

  return request({ url: `/coaches/students?${params.toString()}` });
}

export function fetchCoachStudentDetail(studentId: string) {
  return request({ url: `/coaches/students/${studentId}/detail` });
}

export function createStudentBodyRecord(studentId: string, payload: BodyRecordPayload) {
  return request<BodyRecordPayload, unknown>({
    url: `/coaches/students/${studentId}/body-records`,
    method: 'POST',
    data: payload,
  });
}

export function createStudentTraining(studentId: string, payload: TrainingSessionPayload) {
  return request<TrainingSessionPayload, unknown>({
    url: `/coaches/students/${studentId}/training-sessions`,
    method: 'POST',
    data: payload,
  });
}
