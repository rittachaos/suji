import { request } from '../http';

type ListQuery = {
  keyword?: string;
  status?: string;
  role?: string;
  page?: number;
  pageSize?: number;
};

function toQueryString(query: ListQuery) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  return params.toString();
}

export function fetchAdminUsers(query: ListQuery = {}) {
  return request({ url: `/admin/users?${toQueryString(query)}` });
}

export function fetchAdminCoachApplications(query: ListQuery = {}) {
  return request({ url: `/admin/coach-applications?${toQueryString(query)}` });
}

export function reviewCoachApplication(applicationId: string, payload: { status: 'APPROVED' | 'REJECTED'; reviewNote?: string }) {
  return request({
    url: `/admin/coach-applications/${applicationId}/review`,
    method: 'PATCH',
    data: payload,
  });
}

export function fetchAdminRelations(query: ListQuery = {}) {
  return request({ url: `/admin/relations?${toQueryString(query)}` });
}

export function createAdminRelation(payload: { coachId: string; studentId: string; note?: string }) {
  return request({
    url: '/admin/relations',
    method: 'POST',
    data: payload,
  });
}
