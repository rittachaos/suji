import { request } from '../http';

export function fetchProfile() {
  return request({ url: '/users/profile' });
}

export function updateProfile(payload: Record<string, unknown>) {
  return request({
    url: '/users/profile',
    method: 'PUT',
    data: payload,
  });
}

export function fetchGoal() {
  return request({ url: '/users/goal' });
}

export function updateGoal(payload: Record<string, unknown>) {
  return request({
    url: '/users/goal',
    method: 'PUT',
    data: payload,
  });
}
