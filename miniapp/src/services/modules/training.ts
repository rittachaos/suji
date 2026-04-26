import { ApiListResult, TrainingSessionPayload } from '@/types/api';
import { request } from '../http';

export function fetchTrainingSessions(page = 1, pageSize = 20) {
  return request<never, ApiListResult<TrainingSessionPayload>>({
    url: `/training/sessions?page=${page}&pageSize=${pageSize}`,
  });
}

export function createTrainingSession(payload: TrainingSessionPayload) {
  return request<TrainingSessionPayload, TrainingSessionPayload>({
    url: '/training/sessions',
    method: 'POST',
    data: payload,
  });
}
